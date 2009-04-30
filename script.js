footnote_counter = 1;

function create_footnote(a, i, footnote) {
    if (a.hasClass('footnote') || !a.get('href') || a.get('href')[0] == "#" || a.get('href').search('mailto') != -1) {
        return;
    }
    var note = Element('li');
    note.appendChild(Element('a', {'class': 'footnote', 'href': a.href}).set('text',a.href));
    footnote.appendChild(note);
    
    var sup = Element('sup',{'class':'footnote'}).set('text', footnote_counter);
    a.appendChild(sup);
    footnote_counter++;
}

function create_footnotes(footnote_id) {
    var footnote = $(footnote_id);
    var hrefs = $$('a');
    
    hrefs.each(
        function (a, i) {
            create_footnote(a, i, footnote);
        }
    );
};
