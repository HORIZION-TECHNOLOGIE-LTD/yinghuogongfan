declare module 'grapesjs-tabs' {
  import type { Plugin } from 'grapesjs';
  
  interface TabsPluginOptions {
    /**
     * Block options for the tabs component
     */
    tabsBlock?: {
      /**
       * Category where the tabs block will appear in the block manager
       * @default 'Extra'
       */
      category?: string;
      
      /**
       * Label for the tabs block
       * @default 'Tabs'
       */
      label?: string;
    };
    
    /**
     * Default number of tabs
     * @default 3
     */
    defaultTabs?: number;
    
    /**
     * Tab selector CSS prefix
     * @default 'tab'
     */
    selectorTab?: string;
    
    /**
     * Custom styling for tabs
     */
    style?: string;
  }

  const plugin: Plugin<TabsPluginOptions>;
  export default plugin;
}
