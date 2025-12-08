from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.podcaster.graph import graph as podcaster_graph
from app.agents.podcaster.state import State
from app.db import Chat, Podcast
from app.services.task_logging_service import TaskLoggingService


async def generate_document_podcast(
    session: AsyncSession,
    document_id: int,
    search_space_id: int,
    user_id: int,
    podcast_title: str | None = None,
    user_prompt: str | None = None,
):
    """
    Generate a podcast from a document by concatenating its chunks.
    
    Args:
        session: Database session
        document_id: ID of the document to generate podcast from
        search_space_id: ID of the search space
        user_id: ID of the user
        podcast_title: Optional title for the podcast
        user_prompt: Optional prompt from the user to guide the podcast generation
    """
    from app.db import Document
    from sqlalchemy.orm import selectinload
    
    task_logger = TaskLoggingService(session, search_space_id)

    # Log task start
    log_entry = await task_logger.log_task_start(
        task_name="generate_document_podcast",
        source="podcast_task",
        message=f"Starting podcast generation for document {document_id}",
        metadata={
            "document_id": document_id,
            "search_space_id": search_space_id,
            "podcast_title": podcast_title,
            "user_id": str(user_id),
            "user_prompt": user_prompt,
        },
    )

    try:
        # Fetch the document with the specified ID
        await task_logger.log_task_progress(
            log_entry,
            f"Fetching document {document_id} from database",
            {"stage": "fetch_document"},
        )

        query = (
            select(Document)
            .options(selectinload(Document.chunks))
            .filter(
                Document.id == document_id,
                Document.search_space_id == search_space_id,
            )
        )

        result = await session.execute(query)
        document = result.scalars().first()

        if not document:
            await task_logger.log_task_failure(
                log_entry,
                f"Document with id {document_id} not found in search space {search_space_id}",
                "Document not found",
                {"error_type": "DocumentNotFound"},
            )
            raise ValueError(
                f"Document with id {document_id} not found in search space {search_space_id}"
            )

        # Concatenate document chunks
        await task_logger.log_task_progress(
            log_entry,
            f"Processing document chunks for document {document_id}",
            {"stage": "process_chunks", "chunk_count": len(document.chunks)},
        )

        # Sort chunks by creation time to maintain proper order
        sorted_chunks = sorted(document.chunks, key=lambda x: x.created_at)

        # Concatenate all chunk content
        document_content = "\n\n".join([chunk.content for chunk in sorted_chunks])

        # If no chunks exist, use the document content directly
        if not document_content:
            document_content = document.content

        # Wrap the document content in a structured format
        source_content = f"<document_content>\n<title>{document.title}</title>\n<content>{document_content}</content>\n</document_content>"

        # Pass it to the SurfSense Podcaster
        await task_logger.log_task_progress(
            log_entry,
            f"Initializing podcast generation for document {document_id}",
            {
                "stage": "initialize_podcast_generation",
                "chunk_count": len(sorted_chunks),
                "content_length": len(source_content),
            },
        )

        config = {
            "configurable": {
                "podcast_title": podcast_title or f"Podcast: {document.title}",
                "user_id": str(user_id),
                "search_space_id": search_space_id,
                "user_prompt": user_prompt,
            }
        }
        # Initialize state with database session
        initial_state = State(source_content=source_content, db_session=session)

        # Run the graph directly
        await task_logger.log_task_progress(
            log_entry,
            f"Running podcast generation graph for document {document_id}",
            {"stage": "run_podcast_graph"},
        )

        result = await podcaster_graph.ainvoke(initial_state, config=config)

        # Convert podcast transcript entries to serializable format
        await task_logger.log_task_progress(
            log_entry,
            f"Processing podcast transcript for document {document_id}",
            {
                "stage": "process_transcript",
                "transcript_entries": len(result["podcast_transcript"]),
            },
        )

        serializable_transcript = []
        for entry in result["podcast_transcript"]:
            serializable_transcript.append(
                {"speaker_id": entry.speaker_id, "dialog": entry.dialog}
            )

        # Create a new podcast entry
        await task_logger.log_task_progress(
            log_entry,
            f"Creating podcast database entry for document {document_id}",
            {
                "stage": "create_podcast_entry",
                "file_location": result.get("final_podcast_file_path"),
            },
        )

        # Check if podcast already exists for this document (re-generation)
        existing_podcast = await session.execute(
            select(Podcast).filter(
                Podcast.search_space_id == search_space_id,
                Podcast.chat_id.is_(None),
                Podcast.title == (podcast_title or f"Podcast: {document.title}"),
            )
        )
        existing_podcast = existing_podcast.scalars().first()

        if existing_podcast:
            existing_podcast.podcast_transcript = serializable_transcript
            existing_podcast.file_location = result["final_podcast_file_path"]
            await session.commit()
            await session.refresh(existing_podcast)
            return existing_podcast
        else:
            podcast = Podcast(
                title=podcast_title or f"Podcast: {document.title}",
                podcast_transcript=serializable_transcript,
                file_location=result["final_podcast_file_path"],
                search_space_id=search_space_id,
                chat_id=None,  # Not from a chat
            )

            # Add to session and commit
            session.add(podcast)
            await session.commit()
            await session.refresh(podcast)

            # Log success
            await task_logger.log_task_success(
                log_entry,
                f"Successfully generated podcast for document {document_id}",
                {
                    "podcast_id": podcast.id,
                    "podcast_title": podcast_title or f"Podcast: {document.title}",
                    "transcript_entries": len(serializable_transcript),
                    "file_location": result.get("final_podcast_file_path"),
                    "chunk_count": len(sorted_chunks),
                    "content_length": len(source_content),
                },
            )

            return podcast

    except ValueError as ve:
        # ValueError is already logged above for document not found
        if "not found" not in str(ve):
            await task_logger.log_task_failure(
                log_entry,
                f"Value error during podcast generation for document {document_id}",
                str(ve),
                {"error_type": "ValueError"},
            )
        raise ve
    except SQLAlchemyError as db_error:
        await session.rollback()
        await task_logger.log_task_failure(
            log_entry,
            f"Database error during podcast generation for document {document_id}",
            str(db_error),
            {"error_type": "SQLAlchemyError"},
        )
        raise db_error
    except Exception as e:
        await session.rollback()
        await task_logger.log_task_failure(
            log_entry,
            f"Unexpected error during podcast generation for document {document_id}",
            str(e),
            {"error_type": type(e).__name__},
        )
        raise e


async def generate_chat_podcast(
    session: AsyncSession,
    chat_id: int,
    search_space_id: int,
    user_id: int,
    podcast_title: str | None = None,
    user_prompt: str | None = None,
):
    task_logger = TaskLoggingService(session, search_space_id)

    # Log task start
    log_entry = await task_logger.log_task_start(
        task_name="generate_chat_podcast",
        source="podcast_task",
        message=f"Starting podcast generation for chat {chat_id}",
        metadata={
            "chat_id": chat_id,
            "search_space_id": search_space_id,
            "podcast_title": podcast_title,
            "user_id": str(user_id),
            "user_prompt": user_prompt,
        },
    )

    try:
        # Fetch the chat with the specified ID
        await task_logger.log_task_progress(
            log_entry, f"Fetching chat {chat_id} from database", {"stage": "fetch_chat"}
        )

        query = select(Chat).filter(
            Chat.id == chat_id, Chat.search_space_id == search_space_id
        )

        result = await session.execute(query)
        chat = result.scalars().first()

        if not chat:
            await task_logger.log_task_failure(
                log_entry,
                f"Chat with id {chat_id} not found in search space {search_space_id}",
                "Chat not found",
                {"error_type": "ChatNotFound"},
            )
            raise ValueError(
                f"Chat with id {chat_id} not found in search space {search_space_id}"
            )

        # Create chat history structure
        await task_logger.log_task_progress(
            log_entry,
            f"Processing chat history for chat {chat_id}",
            {"stage": "process_chat_history", "message_count": len(chat.messages)},
        )

        chat_history_str = "<chat_history>"

        processed_messages = 0
        for message in chat.messages:
            if message["role"] == "user":
                chat_history_str += f"<user_message>{message['content']}</user_message>"
                processed_messages += 1
            elif message["role"] == "assistant":
                chat_history_str += (
                    f"<assistant_message>{message['content']}</assistant_message>"
                )
                processed_messages += 1

        chat_history_str += "</chat_history>"

        # Pass it to the SurfSense Podcaster
        await task_logger.log_task_progress(
            log_entry,
            f"Initializing podcast generation for chat {chat_id}",
            {
                "stage": "initialize_podcast_generation",
                "processed_messages": processed_messages,
                "content_length": len(chat_history_str),
            },
        )

        config = {
            "configurable": {
                "podcast_title": podcast_title or "SurfSense Podcast",
                "user_id": str(user_id),
                "search_space_id": search_space_id,
                "user_prompt": user_prompt,
            }
        }
        # Initialize state with database session and streaming service
        initial_state = State(source_content=chat_history_str, db_session=session)

        # Run the graph directly
        await task_logger.log_task_progress(
            log_entry,
            f"Running podcast generation graph for chat {chat_id}",
            {"stage": "run_podcast_graph"},
        )

        result = await podcaster_graph.ainvoke(initial_state, config=config)

        # Convert podcast transcript entries to serializable format
        await task_logger.log_task_progress(
            log_entry,
            f"Processing podcast transcript for chat {chat_id}",
            {
                "stage": "process_transcript",
                "transcript_entries": len(result["podcast_transcript"]),
            },
        )

        serializable_transcript = []
        for entry in result["podcast_transcript"]:
            serializable_transcript.append(
                {"speaker_id": entry.speaker_id, "dialog": entry.dialog}
            )

        # Create a new podcast entry
        await task_logger.log_task_progress(
            log_entry,
            f"Creating podcast database entry for chat {chat_id}",
            {
                "stage": "create_podcast_entry",
                "file_location": result.get("final_podcast_file_path"),
            },
        )

        # check if podcast already exists for this chat (re-generation)
        existing_podcast = await session.execute(
            select(Podcast).filter(Podcast.chat_id == chat_id)
        )
        existing_podcast = existing_podcast.scalars().first()

        if existing_podcast:
            existing_podcast.podcast_transcript = serializable_transcript
            existing_podcast.file_location = result["final_podcast_file_path"]
            existing_podcast.chat_state_version = chat.state_version
            await session.commit()
            await session.refresh(existing_podcast)
            return existing_podcast
        else:
            podcast = Podcast(
                title=f"{podcast_title}",
                podcast_transcript=serializable_transcript,
                file_location=result["final_podcast_file_path"],
                search_space_id=search_space_id,
                chat_state_version=chat.state_version,
                chat_id=chat.id,
            )

            # Add to session and commit
            session.add(podcast)
            await session.commit()
            await session.refresh(podcast)

            # Log success
            await task_logger.log_task_success(
                log_entry,
                f"Successfully generated podcast for chat {chat_id}",
                {
                    "podcast_id": podcast.id,
                    "podcast_title": podcast_title,
                    "transcript_entries": len(serializable_transcript),
                    "file_location": result.get("final_podcast_file_path"),
                    "processed_messages": processed_messages,
                    "content_length": len(chat_history_str),
                },
            )

            return podcast

    except ValueError as ve:
        # ValueError is already logged above for chat not found
        if "not found" not in str(ve):
            await task_logger.log_task_failure(
                log_entry,
                f"Value error during podcast generation for chat {chat_id}",
                str(ve),
                {"error_type": "ValueError"},
            )
        raise ve
    except SQLAlchemyError as db_error:
        await session.rollback()
        await task_logger.log_task_failure(
            log_entry,
            f"Database error during podcast generation for chat {chat_id}",
            str(db_error),
            {"error_type": "SQLAlchemyError"},
        )
        raise db_error
    except Exception as e:
        await session.rollback()
        await task_logger.log_task_failure(
            log_entry,
            f"Unexpected error during podcast generation for chat {chat_id}",
            str(e),
            {"error_type": type(e).__name__},
        )
        raise RuntimeError(
            f"Failed to generate podcast for chat {chat_id}: {e!s}"
        ) from e
