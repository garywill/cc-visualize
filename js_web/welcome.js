onDCL(function() {
    var text2inspect = "";
    
    var oURL = new URL(document.location.href);
    var text_from_GET =  oURL.searchParams.get("s") ;   
    
    if (text_from_GET)
        text2inspect = decodeURIComponent ( text_from_GET );
    else
        text2inspect = "歡迎！建議先到Github源碼主頁上看看介紹說明（雖然用起來其實很簡單）和各樣截圖";
    
    startNewCheck(text2inspect);
    show_check_results(1);
    reset();
});

function scrollToResult() {
    window.scrollTo ( { top:  $$("#div_result").offsetTop - 120, left: 0, behavior: "smooth" } );
}
