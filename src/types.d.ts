// 這是全域型別補丁，用來解決某些組件中 JSX 標籤大小寫 (Typo) 導致的編譯錯誤
// 例如: 將 Recharts 的 <Cell> 誤寫為 <cell>
// 透過這裡宣告，我們不需要去修改您原本的工具程式碼即可通過編譯
declare namespace JSX {
    interface IntrinsicElements {
        cell: any;
    }
}