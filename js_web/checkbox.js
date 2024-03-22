 
onDCL(function() {
    const form = $$("#form_UnCond");
    
    for ( var name of Object.keys(UnCond))
    {
        const condObj = UnCond[name];
        
        var span_cb = htmlStr2dom(`
        <li title="${escapeHtml(name)}">
            <input type="checkbox" class="cb_UnCond" name="${name}"  >[${escapeHtml(condObj['short_desc'])}] ${escapeHtml(condObj['full_desc'])}</input>
        </li>
        `);
        span_cb.q$("input").checked = condObj.default_checked;
       
        form.appendChild(span_cb);
    }
    $$("#options_extcoll").open = true;
});


