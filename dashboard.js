/*
Dashboard JS
*/

var message_count = [];

function add_entry(destination, message, position) {
    var container = null;
    if (destination == '/topic/twitter') {
        container = $('twitter');
    }
    if (destination == '/topic/twitter_links') {
        container = $('twitter_links');
    }
    if (destination == '/topic/reliable') {
        container = $('reliable');
    }
    if (!message_count[destination]) {
        message_count[destination] = 0;
    }
    var message_element = Element('div',{'class': 'message'})
    var user_ref = Element('div', {'class': 'from_user'})
    user_ref.appendChild(Element('a',{'href': 'http://twitter.com/'+message.from_user}).set('text',message.from_user));
    message_element.appendChild(user_ref);
    message_element.appendChild(Element('img', {'class': 'profile_image'}).set('src',message.profile_image_url));
    var text = Element('div')
    var processed_text = message.text;
    processed_text = processed_text.replace(/(http:\/\/[^ ]+)/g, '<a href="$1">$1</a>');
    processed_text = processed_text.replace(/(#[^ ]+)/g, '<a href="http://search.twitter.com/search?q=$1">$1</a>');
    text.innerHTML = processed_text;
    message_element.appendChild(text);
    message_element.inject(container, position);
    message_element.slide('hide');
    message_element.slide('in');
    message_count[destination] ++;
    if (message_count[destination] > 15) {
        container.getLast().destroy();
    }
}

function dashboard_init() {
    var jsonRequest = new Request.JSON({url: "twitter_links_load.js", onComplete: function(d){
        d.twitter_links_load.each(
            function (e) {
                add_entry('/topic/twitter_links', e, 'bottom');
            }
        );
        }}).get();
    var jsonRequest = new Request.JSON({url: "twitter_load.js", onComplete: function(d){
        d.twitter_load.each(
            function (e) {
                add_entry('/topic/twitter', e, 'bottom');
            }
        );
        new Request.JSON({url: "reliable_load.js", onComplete: function(d){
            d.reliable_load.each(
                function (e) {
                    add_entry('/topic/reliable', e, 'bottom');
                }
            );
            }}).get();
        }}).get();
    
    
    stomp = new STOMPClient();
    stomp.onopen = function() {
    };
    stomp.onclose = function(c) { alert('Lost Connection, Code: ' + c);};
    stomp.onerror = function(error) {
        alert("Error: " + error);
    };
    stomp.onerrorframe = function(frame) {
        alert("Error: " + frame.body);
    };
    stomp.onconnectedframe = function() {
        stomp.subscribe("/topic/twitter");
        stomp.subscribe("/topic/twitter_links");
        stomp.subscribe("/topic/reliable");
    };
    stomp.onmessageframe = function(frame) {
        var message = JSON.decode(frame.body);
        add_entry(frame.headers.destination, message,'top');
        /* var container = document.getElementById('container');
        container.inject(Element('div').set('text',message.text),'top'); */
    };
    stomp.connect('h1n1.co.nz', 61613);
}

