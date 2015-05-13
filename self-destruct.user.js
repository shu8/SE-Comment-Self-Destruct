// ==UserScript==
// @name         Comment self destruct
// @namespace    http://stackexchange.com/users/4337810/%E1%94%95%E1%96%BA%E1%98%8E%E1%95%8A
// @version      1.2
// @description  Adds a button to allow you to self-destruct comments after a period of time
// @author       ᔕᖺᘎᕊ (http://stackexchange.com/users/4337810/%E1%94%95%E1%96%BA%E1%98%8E%E1%95%8A)
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==
if (window.location.href.indexOf('/users/') > -1) { //Add the add features link
    $('.additional-links').append('<span class="lsep">|</span><a href="javascript:;" id="accessTokenLink">self-destruct access-token</a>');
    $('.sub-header-links.fr').append('<span class="lsep">|</span><a href="javascript:;" id="accessTokenLink">self-destruct access-token</a>'); //Old profile (pre Feb-2015)
    $('#accessTokenLink').click(function() {
        var token = window.prompt('Please enter your access token:');
        if(token) {
            GM_setValue("commentSelfDestruct-access_token", token);
        }
    });
}

var times = {},
    sitename = $(location).attr('hostname').split('.')[0];

setTimeout(function() {
    if(GM_getValue('commentSelfDestruct-timesIds', -1) == -1) {
        GM_setValue('commentSelfDestruct-timesIds', JSON.stringify(times));        
    } else {
        times = JSON.parse(GM_getValue('commentSelfDestruct-timesIds'));
    }
    
    if(!GM_getValue('commentSelfDestruct-access_token')) {
        alert('Please register for an access token by going to http://shu8.github.io/SE-Comment-Self-Destruct/');
    }

    $('.comment').each(function() {
        $that = $(this);
        if($that.find('.comment-user').text() == $('.topbar-links a span:eq(0)').text() || $that.find('.comment-user').text() == $('.topbar-links a .gravatar-wrapper-24').attr('title')) {
            $that.find('.comment-date').after("<span id='"+$that.attr('id').split('-')[1]+"' class='self-destruct' style='cursor:pointer; color:blue'>&nbsp;self-destruct</span>");
        }
    });
    
    $('.js-show-link.comments-link').click(function() { //Keep buttons when 'show x more comments' is clicked
        setTimeout(function() {
            $('.comment').each(function() {
                $that = $(this);
                if($that.find('.comment-user').text() == $('.topbar-links a span:eq(0)').text() || $that.find('.comment-user').text() == $('.topbar-links a .gravatar-wrapper-24').attr('title')) {
                    $that.find('.comment-date').after("<span id='"+$that.attr('id').split('-')[1]+"' class='self-destruct' style='cursor:pointer; color:blue'>&nbsp;self-destruct</span>");
                }
            });
        }, 1000);
    });
    
    $('.self-destruct').on('click', function() {
        days = prompt('Please enter the number of days in which to delete this comment');
        id = $(this).attr('id');
        if(days) {
            var date = new Date();
            times[id] = date.setDate(date.getDate() + parseInt(days));
            GM_setValue('commentSelfDestruct-timesIds', JSON.stringify(times));
            console.log(times);
        }        
    });
    setInterval(everyHour, 1000);
}, 500);

//http://stackoverflow.com/a/19847496/3541881:
function everyHour() {
    var mins = new Date().getMinutes();
    var times = JSON.parse(GM_getValue('commentSelfDestruct-timesIds'))
    if(mins == "00"){
        console.log(times);
        $.each(times, function(id,time) {             
            if(new Date().getTime() > time) {
                alert('deleting');
                console.log('Deleting comment #' + id);
                $.ajax({
                    type: "POST",
                    url: "https://api.stackexchange.com/2.2/comments/" + id + "/delete",
                    data: {
                        'site': sitename,
                        'key': 'II*AM0Q5sCGDmtKHFKrRuA((',
                        'access_token': GM_getValue('commentSelfDestruct-access_token')
                    }
                });
                delete times[id]
                GM_setValue('commentSelfDestruct-timesIds', JSON.stringify(times)); 
            }
        });
     }
}
