# WebMagic 网络爬虫集成指南 | WebMagic Web Crawler Integration Guide

本指南介绍如何使用 WebMagic 作为 SurfSense 的网络爬虫替代方案。

This guide explains how to use WebMagic as an alternative web crawler for SurfSense.

---

## 📋 关于 WebMagic | About WebMagic

WebMagic 是一个简单灵活的 Java 爬虫框架，完全模块化设计，支持多线程抓取。它借鉴了 Scrapy 的设计思想，是一个优秀的国产开源爬虫框架。

WebMagic is a simple and flexible Java web crawler framework with a fully modular design supporting multi-threaded crawling. Inspired by Scrapy's design philosophy, it's an excellent open-source Chinese crawler framework.

### 核心特性 | Key Features

- ✅ **简单易用** - 完全模块化设计，易于扩展
- ✅ **高性能** - 支持多线程抓取，性能优异
- ✅ **灵活配置** - 支持注解和链式 API 两种配置方式
- ✅ **分布式支持** - 支持分布式爬虫
- ✅ **丰富的组件** - 内置多种下载器、处理器和持久化方案
- ✅ **中文友好** - 完善的中文文档和社区支持

---

## 🔗 项目信息 | Project Information

- **GitHub 仓库**: [https://github.com/code4craft/webmagic](https://github.com/code4craft/webmagic)
- **Gitee 镜像**: [https://gitee.com/flashsword20/webmagic.git](https://gitee.com/flashsword20/webmagic.git)
- **官方文档**: [http://webmagic.io/docs/](http://webmagic.io/docs/)
- **开发语言**: Java
- **License**: Apache License 2.0

---

## 🎯 为什么选择 WebMagic? | Why Choose WebMagic?

### SurfSense 当前爬虫方案 | SurfSense Current Crawler

SurfSense 目前使用：
- **Firecrawl** - 基于云的网页抓取服务
- **AsyncChromiumLoader** - 基于 Chromium 的异步加载器

### WebMagic 的优势 | WebMagic Advantages

| 特性 | WebMagic | Firecrawl | AsyncChromiumLoader |
|-----|----------|-----------|---------------------|
| **部署方式** | 自托管 Java 应用 | 云服务/自托管 | 需要浏览器依赖 |
| **成本** | 免费开源 | 按量付费/自托管 | 免费 |
| **性能** | 高性能多线程 | 依赖服务 | 较重 |
| **JavaScript 渲染** | 需配置 Selenium | 支持 | 原生支持 |
| **中文支持** | 优秀 | 一般 | 一般 |
| **分布式** | 原生支持 | 有限 | 不支持 |
| **定制化** | 高度灵活 | 有限 | 中等 |

### 适用场景 | Use Cases

WebMagic 特别适合以下场景：

1. **大规模数据抓取** - 需要爬取大量网页时
2. **中文网站爬取** - 针对中文网站优化
3. **定制化需求** - 需要高度定制化的爬虫逻辑
4. **成本敏感** - 希望避免云服务费用
5. **内网部署** - 需要在内网环境使用

---

## 🚀 快速开始 | Quick Start

### 1. 环境要求 | Requirements

- **Java**: JDK 8 或更高版本（推荐 JDK 11 或 JDK 17）
- **Maven**: 3.x 或更高版本（推荐）

### 2. Maven 依赖 | Maven Dependency

```xml
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-core</artifactId>
    <version>0.9.1</version>
</dependency>
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-extension</artifactId>
    <version>0.9.1</version>
</dependency>
```

### 3. 简单示例 | Basic Example

```java
import us.codecraft.webmagic.Page;
import us.codecraft.webmagic.Site;
import us.codecraft.webmagic.Spider;
import us.codecraft.webmagic.processor.PageProcessor;

public class SurfSenseCrawler implements PageProcessor {
    
    private Site site = Site.me()
            .setRetryTimes(3)
            .setSleepTime(1000)
            .setCharset("UTF-8");

    @Override
    public void process(Page page) {
        // 提取标题
        String title = page.getHtml()
                .xpath("//title/text()").toString();
        
        // 提取正文内容
        String content = page.getHtml()
                .xpath("//body/text()").toString();
        
        // 提取所有链接
        page.addTargetRequests(
            page.getHtml().links().regex(".*").all()
        );
        
        // 存储结果
        page.putField("title", title);
        page.putField("content", content);
        page.putField("url", page.getUrl().toString());
    }

    @Override
    public Site getSite() {
        return site;
    }

    public static void main(String[] args) {
        Spider.create(new SurfSenseCrawler())
                .addUrl("https://example.com")
                .thread(5)
                .run();
    }
}
```

---

## 🔧 与 SurfSense 集成 | Integration with SurfSense

### 集成方案 | Integration Approach

有两种方式将 WebMagic 与 SurfSense 集成：

#### 方案 A: 独立爬虫服务 | Standalone Crawler Service

创建一个独立的 Java 微服务，通过 REST API 与 SurfSense 后端通信。

**架构流程**:
1. SurfSense 后端发送爬取请求到 WebMagic 服务
2. WebMagic 服务执行爬取任务
3. 爬取结果通过 API 返回给 SurfSense
4. SurfSense 处理并存储到数据库

**优势**:
- 技术栈独立，易于维护
- 可以独立扩展爬虫服务
- 不影响现有架构

#### 方案 B: Python-Java 桥接 | Python-Java Bridge

使用 `JPype` 或 `Py4J` 在 Python 代码中调用 WebMagic。

**优势**:
- 集成更紧密
- 减少网络调用开销
- 统一部署

**劣势**:
- 需要 JVM 环境
- 配置较复杂

### 推荐实现 | Recommended Implementation

**方案 A (独立服务)** 是推荐方案，因为：
- 保持 SurfSense 架构简洁
- WebMagic 服务可选，不影响现有功能
- 易于为不同用户提供定制化爬虫服务

---

## 📝 REST API 服务示例 | REST API Service Example

### Spring Boot WebMagic 服务 | Spring Boot WebMagic Service

```java
// Required imports
import org.springframework.web.bind.annotation.*;
import us.codecraft.webmagic.Page;
import us.codecraft.webmagic.Site;
import us.codecraft.webmagic.Spider;
import us.codecraft.webmagic.Task;
import us.codecraft.webmagic.ResultItems;
import us.codecraft.webmagic.pipeline.Pipeline;
import us.codecraft.webmagic.processor.PageProcessor;

import java.util.*;

// Request and Response DTOs
public class CrawlRequest {
    private String url;
    private Integer threads;
    private Integer depth;
    
    // Getters and setters
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Integer getThreads() { return threads; }
    public void setThreads(Integer threads) { this.threads = threads; }
    public Integer getDepth() { return depth; }
    public void setDepth(Integer depth) { this.depth = depth; }
}

public class CrawlResult {
    private String url;
    private String status;
    private Map<String, Object> data;
    
    public CrawlResult(String url, String status, Map<String, Object> data) {
        this.url = url;
        this.status = status;
        this.data = data;
    }
    
    // Getters and setters
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}

// Custom PageProcessor implementation
class CustomPageProcessor implements PageProcessor {
    private CrawlRequest request;
    private Site site;
    
    public CustomPageProcessor(CrawlRequest request) {
        this.request = request;
        this.site = Site.me()
            .setRetryTimes(3)
            .setSleepTime(1000)
            .setCharset("UTF-8");
    }
    
    @Override
    public void process(Page page) {
        // Extract data based on request configuration
        page.putField("title", page.getHtml().xpath("//title/text()").toString());
        page.putField("content", page.getHtml().xpath("//body/text()").toString());
        page.putField("url", page.getUrl().toString());
    }
    
    @Override
    public Site getSite() {
        return site;
    }
}

// Controller implementation
@RestController
@RequestMapping("/api/crawler")
public class WebMagicController {
    
    @PostMapping("/crawl")
    public CrawlResult crawlUrl(@RequestBody CrawlRequest request) {
        // Create result items collector
        ResultItemsCollectorPipeline collector = new ResultItemsCollectorPipeline();
        
        // Create spider instance
        CustomPageProcessor processor = new CustomPageProcessor(request);
        Spider spider = Spider.create(processor)
                .addUrl(request.getUrl())
                .addPipeline(collector)
                .thread(request.getThreads() != null ? request.getThreads() : 5);
        
        // Execute crawl
        spider.run();
        
        // Extract collected data
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("pageCount", collector.getResults().size());
        extractedData.put("items", collector.getResults());
        
        // Return result
        return new CrawlResult(
            request.getUrl(),
            "completed",
            extractedData
        );
    }
}

// Helper class to collect results
class ResultItemsCollectorPipeline implements Pipeline {
    private List<ResultItems> results = new ArrayList<>();
    
    @Override
    public void process(ResultItems resultItems, Task task) {
        if (!resultItems.isSkip()) {
            results.add(resultItems);
        }
    }
    
    public List<ResultItems> getResults() {
        return results;
    }
}
```

### SurfSense 后端调用示例 | SurfSense Backend Call Example

```python
import httpx
from typing import Optional

class WebMagicClient:
    """WebMagic crawler service client."""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def crawl_url(
        self,
        url: str,
        threads: int = 5,
        depth: int = 1
    ) -> dict:
        """Send crawl request to WebMagic service."""
        response = await self.client.post(
            f"{self.base_url}/api/crawler/crawl",
            json={
                "url": url,
                "threads": threads,
                "depth": depth
            }
        )
        response.raise_for_status()
        return response.json()
    
    async def get_status(self, job_id: str) -> dict:
        """Get crawl job status."""
        response = await self.client.get(
            f"{self.base_url}/api/crawler/status/{job_id}"
        )
        response.raise_for_status()
        return response.json()
```

---

## ⚙️ 高级配置 | Advanced Configuration

### 1. 代理设置 | Proxy Configuration

```java
Site site = Site.me()
    .setHttpProxy(new HttpHost("proxy.example.com", 8080));
```

### 2. 用户代理轮换 | User-Agent Rotation

```java
Site site = Site.me()
    .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)...")
    .addHeader("Accept", "text/html,application/xhtml+xml")
    .addHeader("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");
```

### 3. JavaScript 渲染 | JavaScript Rendering

对于需要 JavaScript 渲染的页面，使用 Selenium 扩展：

```xml
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-selenium</artifactId>
    <version>0.9.1</version>
</dependency>
```

```java
Spider.create(new MyPageProcessor())
    .setDownloader(new SeleniumDownloader())
    .addUrl("https://example.com")
    .run();
```

### 4. 分布式爬虫 | Distributed Crawling

使用 Redis 实现分布式队列：

```xml
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-extension</artifactId>
    <version>0.9.1</version>
</dependency>
```

```java
Spider.create(new MyPageProcessor())
    .setScheduler(new RedisScheduler("localhost"))
    .addUrl("https://example.com")
    .thread(10)
    .run();
```

---

## 🔍 最佳实践 | Best Practices

### 1. 爬虫礼节 | Crawler Etiquette

```java
Site site = Site.me()
    .setSleepTime(1000)          // 请求间隔 1 秒
    .setRetryTimes(3)             // 重试次数
    .setTimeOut(10000)            // 超时时间 10 秒
    .setCharset("UTF-8")          // 字符编码
    .setUserAgent("SurfSense Bot/1.0"); // 标识爬虫
```

### 2. 错误处理 | Error Handling

```java
@Override
public void process(Page page) {
    try {
        // 爬取逻辑
        String title = page.getHtml().xpath("//title/text()").toString();
        
        if (title == null || title.isEmpty()) {
            page.setSkip(true); // 跳过无效页面
            return;
        }
        
        page.putField("title", title);
    } catch (Exception e) {
        logger.error("Error processing page: " + page.getUrl(), e);
        page.setSkip(true);
    }
}
```

### 3. 数据清洗 | Data Cleaning

```java
// 清理 HTML 标签
String cleanText = page.getHtml()
    .xpath("//body/allText()")
    .toString()
    .replaceAll("\\s+", " ")  // 规范化空白字符
    .trim();

// 提取特定格式数据
String date = page.getHtml()
    .xpath("//span[@class='date']/text()")
    .toString();
```

### 4. 性能优化 | Performance Optimization

- **合理设置线程数**: 根据目标网站负载能力调整
- **使用连接池**: 复用 HTTP 连接
- **实现增量爬取**: 只爬取更新的内容
- **使用布隆过滤器**: 去除重复 URL

---

## 🔒 安全考虑 | Security Considerations

### 1. Robots.txt 遵守 | Robots.txt Compliance

```java
// WebMagic doesn't have built-in robots.txt support
// Use crawler-commons library for robots.txt checking
// Add dependency:
// <dependency>
//     <groupId>com.github.crawler-commons</groupId>
//     <artifactId>crawler-commons</artifactId>
//     <version>1.2</version>
// </dependency>

import crawlercommons.robots.SimpleRobotRules;
import crawlercommons.robots.SimpleRobotRulesParser;

public boolean isAllowed(String url) {
    SimpleRobotRulesParser parser = new SimpleRobotRulesParser();
    // Fetch and parse robots.txt
    // Check if URL is allowed for the user-agent
    SimpleRobotRules rules = parser.parseContent(
        url, 
        robotsTxtContent, 
        "text/plain", 
        "SurfSense Bot"
    );
    return rules.isAllowed(url);
}
```

### 2. 访问频率限制 | Rate Limiting

```java
Site site = Site.me()
    .setSleepTime(1000)           // 最小间隔
    .setRetrySleepTime(3000);     // 重试间隔
```

### 3. IP 轮换 | IP Rotation

```java
import org.apache.http.HttpHost;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

// Implement custom proxy rotation
public class ProxyProvider {
    private List<HttpHost> proxies;
    private AtomicInteger counter = new AtomicInteger(0);
    
    public ProxyProvider(List<HttpHost> proxies) {
        this.proxies = proxies;
    }
    
    public HttpHost getNextProxy() {
        int index = counter.getAndIncrement() % proxies.size();
        return proxies.get(index);
    }
}

// Use in Site configuration
ProxyProvider proxyProvider = new ProxyProvider(Arrays.asList(
    new HttpHost("proxy1.example.com", 8080),
    new HttpHost("proxy2.example.com", 8080)
));

Site site = Site.me()
    .setHttpProxy(proxyProvider.getNextProxy());
```

---

## 📊 监控与日志 | Monitoring and Logging

### 1. 爬取统计 | Crawl Statistics

```java
import us.codecraft.webmagic.*;
import us.codecraft.webmagic.pipeline.*;
import java.util.concurrent.atomic.AtomicInteger;

Spider spider = Spider.create(new MyPageProcessor())
    .addUrl("https://example.com")
    .addPipeline(new ConsolePipeline())
    .thread(5);

spider.run();

// WebMagic doesn't provide built-in detailed statistics
// Implement custom statistics tracking using Pipeline
class StatisticsPipeline implements Pipeline {
    private AtomicInteger successCount = new AtomicInteger(0);
    private AtomicInteger errorCount = new AtomicInteger(0);
    
    @Override
    public void process(ResultItems resultItems, Task task) {
        if (resultItems.isSkip()) {
            errorCount.incrementAndGet();
        } else {
            successCount.incrementAndGet();
        }
    }
    
    public int getSuccessCount() {
        return successCount.get();
    }
    
    public int getErrorCount() {
        return errorCount.get();
    }
}

// Usage
StatisticsPipeline stats = new StatisticsPipeline();
spider.addPipeline(stats);
spider.run();

System.out.println("成功: " + stats.getSuccessCount());
System.out.println("失败: " + stats.getErrorCount());
```

### 2. 日志配置 | Logging Configuration

```xml
<!-- logback.xml -->
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/webmagic-crawler.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <logger name="us.codecraft.webmagic" level="INFO"/>
    
    <root level="INFO">
        <appender-ref ref="FILE" />
    </root>
</configuration>
```

---

## 🆘 故障排除 | Troubleshooting

### 常见问题 | Common Issues

#### 1. **连接超时 | Connection Timeout**
```java
Site site = Site.me()
    .setTimeOut(30000)  // 增加到 30 秒
    .setRetryTimes(5);
```

#### 2. **编码问题 | Encoding Issues**
```java
Site site = Site.me()
    .setCharset("UTF-8");  // 或 "GBK" for some Chinese sites
```

#### 3. **反爬虫措施 | Anti-Crawler Measures**
- 使用代理 IP 池
- 随机化 User-Agent
- 增加请求间隔
- 使用 Selenium 模拟真实浏览器

#### 4. **内存溢出 | Out of Memory**
```java
// Use BloomFilterDuplicateRemover for memory-efficient duplicate detection
Spider.create(new MyPageProcessor())
    .setScheduler(new QueueScheduler()
        .setDuplicateRemover(new BloomFilterDuplicateRemover()))
    .thread(5)
    .run();

// Or adjust JVM heap size
// java -Xmx2g -jar webmagic-crawler.jar
```

---

## 📚 学习资源 | Learning Resources

### 官方文档 | Official Documentation
- [WebMagic 官方文档](http://webmagic.io/docs/zh/)
- [WebMagic GitHub](https://github.com/code4craft/webmagic)

### 教程与示例 | Tutorials and Examples
- [WebMagic in Action](https://github.com/code4craft/webmagic/tree/master/webmagic-samples)
- [WebMagic 中文教程](http://webmagic.io/docs/zh/posts/ch1-overview/)

### 社区支持 | Community Support
- GitHub Issues: [WebMagic Issues](https://github.com/code4craft/webmagic/issues)
- Gitter 聊天室: [WebMagic Gitter](https://gitter.im/code4craft/webmagic)

---

## 🔄 与 SurfSense 功能对比 | Feature Comparison with SurfSense

| 功能 | SurfSense 原生 | WebMagic 集成 |
|-----|---------------|---------------|
| **URL 抓取** | ✅ | ✅ |
| **Markdown 输出** | ✅ | 需要转换 |
| **JavaScript 渲染** | ✅ (Chromium) | ✅ (Selenium) |
| **并发控制** | ✅ | ✅ |
| **分布式** | ❌ | ✅ |
| **增量爬取** | 部分 | ✅ |
| **深度爬取** | ❌ | ✅ |
| **自定义规则** | 有限 | ✅ 高度灵活 |

---

## 💡 使用建议 | Usage Recommendations

### 何时使用 WebMagic | When to Use WebMagic

✅ **推荐使用 WebMagic**:
- 需要爬取大量中文网站
- 需要分布式爬虫能力
- 需要高度定制化的爬取逻辑
- 希望降低云服务成本
- 有 Java 开发能力的团队

⚠️ **继续使用 Firecrawl/Chromium**:
- 需要简单快速的单页面抓取
- 不想维护额外的 Java 服务
- 主要处理动态 JavaScript 页面
- 小规模数据抓取

### 混合使用方案 | Hybrid Approach

最佳实践是根据场景选择：

```python
# Example: Smart crawler selection in SurfSense backend
from app.tasks.document_processors.url_crawler import add_crawled_url_document

async def crawl_url_smart(url: str, session: AsyncSession, search_space_id: int, user_id: str):
    """智能选择爬虫方案 | Smart crawler selection"""
    
    # Helper function to determine if large-scale crawling is needed
    def is_large_scale_task(url: str) -> bool:
        # Example logic: check if URL requires deep crawling
        # This is a placeholder - implement based on your needs
        return "site-to-crawl-deeply.com" in url
    
    # Initialize WebMagic client (configuration needed)
    webmagic_client = WebMagicClient(base_url="http://webmagic-service:8080")
    
    # 判断是否为大规模任务
    if is_large_scale_task(url):
        # 使用 WebMagic 进行深度爬取
        return await webmagic_client.crawl_url(url, depth=3, threads=10)
    else:
        # 使用现有的 Firecrawl/Chromium
        return await add_crawled_url_document(session, url, search_space_id, user_id)
```

---

## 📝 总结 | Summary

WebMagic 是一个强大的 Java 爬虫框架，特别适合中文网站的大规模数据抓取。通过独立微服务的方式，可以很好地与 SurfSense 集成，为用户提供更灵活、更强大的网络爬取能力。

WebMagic is a powerful Java crawler framework, particularly suitable for large-scale data extraction from Chinese websites. By integrating it as a standalone microservice, it can work seamlessly with SurfSense to provide users with more flexible and powerful web crawling capabilities.

---

## 🔗 相关链接 | Related Links

- [SurfSense 文档](https://www.surfsense.net/docs/)
- [WebMagic GitHub](https://github.com/code4craft/webmagic)
- [WebMagic Gitee 镜像](https://gitee.com/flashsword20/webmagic.git)
- [中文 LLM 配置指南](./chinese-llm-setup.md)

---

**如有问题，欢迎在 [SurfSense Discord](https://discord.gg/ejRNvftDp9) 讨论！**

**For questions, feel free to discuss in [SurfSense Discord](https://discord.gg/ejRNvftDp9)!**
