 
onDCL(function() {
    const form = $$("#form_UnCond");
    
    for (name of Object.keys(UnCond))
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


function readUserCond() 
{
    var userCond = [];
    if (isWeb)
    {
        const checkboxes = Array.from( $$$("#form_UnCond .cb_UnCond") );
        for (cb of checkboxes)
        {
            const name = cb.getAttribute("name");
            if (cb.checked)
            userCond.push( name );
        }
    }
    else if (isNode)
    {
        for (name in UnCond)
        {
            userCond.push( name );
        }
    }
    return userCond;
}