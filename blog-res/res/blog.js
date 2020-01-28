var ajaxRequest = null;

// Generate the navigation bar contents
function gen_nav(location){
    //var location = $(location); //jquery object
    //alert(location.attr('host'));
    //alert($(location).attr('pathname'));
    var pathname = location.attr('pathname');
    var search = location.attr('search');
    var hash = location.attr('hash');

    // alert( pathname + '\n' +
    //        search + '\n' +
    //        hash );

    // Change pathname to search
    pathname = search.replace(/^\?/g, "");

    //formalize the pathname
    //1. remove redundant slash
    //2. remove the prefix
    //3. remove the tailing slash
    pathname = pathname.replace(/(\/)+/g, "/");
    pathname = pathname.replace(/\/$/, "");
    pathname = pathname.replace(/^\/blog-res\/blog(\/)*/, "");
    // for /blog/ redirection
    pathname = pathname.replace(/^\/blog(\/)+/, "");
    pathname = pathname.replace(/^\/blog$/, "");
    //alert(pathname);

    // for ?/...
    pathname = pathname.replace(/^(\/)+/, "");

    // first remove the date part, the time part should
    // always at the end of the pathname
    // Example:
    // .../2012/
    // .../2012/08/
    // .../2012/08/31/
    // (with or without the tailing slash)
    var year = undefined;
    var month = undefined;
    var date = undefined;

    var path_parts = pathname.split(/\//);
    //alert("this " + path_parts);
    var remain_parts = [];

    var elem = undefined;

    while(elem=path_parts[0]){
        //alert("this " + elem);
        if(/^[^0-9].*$/.test(elem)){
            //alert("here");
            elem = path_parts.shift();
            remain_parts.push(elem);
        } else {
            break;
        }
    }
    //alert("that" + remain_parts);
    pathname = remain_parts.join("\/");

    if(path_parts.length>0){
        year=path_parts[0];
        if(path_parts.length>1){
            month=path_parts[1];
            if(path_parts.length>2){
                date=path_parts[2];
            }
        }
    }
    //TODO: formalize the year month date
    //alert(pathname);
    //TAG
    var tags = [];
    if(/^tags\/[^\/]+/.test(pathname)) {
        var tag_str = (pathname.match(/^tags\/[^\/]+/))[0];
        tag_str = tag_str.replace(/^tags\//, "");

        var tag_op = "or";
        var tag_list = undefined;
        if(/,/.test(tag_str)){
            tag_op = "and";
            tag_str = tag_str.replace(/,+/g, ",");
            tag_str = tag_str.replace(/^,/, "");
            tag_str = tag_str.replace(/,$/, "");
            if(!(tag_str=="")){
                tags = tag_str.split(",");
            }
        } else if (/\;/.test(tag_str)){
            tag_op = "or";
            tag_str = tag_str.replace(/\;+/g, ";");
            tag_str = tag_str.replace(/^\;/, "");
            tag_str = tag_str.replace(/\;$/, "");
            if(!(tag_str=="")){
                tags = tag_str.split("\;");
            }
        } else {
            tags = [tag_str];
        }
        if(tags) {
            var tmp = [];
            $.each(tags, function(entryIndex, entry){
                tmp.push(decodeURI(entry));
            });
            tags = tmp;
        }
        pathname=pathname.replace(/^tags\/[^\/]+(\/)*/, "");
    }
    //alert("tags " + tags);
    //alert("pathname " + pathname);
    //alert(typeof json["muse-ext-blog-pub-data"]["Computer\/Debian\/indexinglinuxfilesviagnometracker"].title);

    // parse category
    var unique = false;
    var categories = [];
    var file_path = "";

    // remove the possible .html suffix
    pathname=pathname.replace(/\.html$/,"");

    if (json["muse-ext-blog-pub-data"][pathname]) {
        unique=true;
        file_path = pathname;
        categories = pathname.split(/\//);
        categories.pop();

    } else {
        if(!(pathname=="")){
            categories = pathname.split(/\//);
        }
    }

    //alert(JSON.stringify);// native code
    var ret = {
        "unique": unique,
        "file-path": pathname,
        "tag-op": tag_op,
        "tags": tags,
        "categories": categories,
        "year": year,
        "month": month,
        "date": date,
        "last": "last"
    };
    //alert(JSON.stringify(ret));
    return ret;
}

function get_category_name(category){
    //alert(json["category-to-name-map"][category]);
    var name = json["category-to-name-map"][category];
    if(!name) {
        var segs = category.split(/\//);
        name = segs.pop();
    }
    return name;
}


function gen_nav_bar(nav_info){
    var html = '';
    var unique = nav_info['unique'];

    if(unique) return;

    var categories = nav_info["categories"];
    var category_str = '';


    //generate categories
    if(categories && categories.length >0 ) {
        $.each(categories, function(entryIndx, entry){
            category_str += '/' + entry;
            html += '&nbsp;&#187;&nbsp;' + '<a href="/blog-res/blog?' + category_str + '">';
            html += get_category_name(category_str);
            html += '</a>';
        });
    }


    if(!unique){
        var year = nav_info['year'];
        var month = nav_info['month'];
        var date = nav_info['date'];

        var time_str = '';

        //generate time
        if(year){
            time_str += '/' + year;
            html += '&nbsp;&#187;&nbsp;' + '<a href="/blog-res/blog?' + time_str + '">';
            html += year;
            html += '</a>'
        }

        if(month){
            time_str += '/' + month;
            html += '&nbsp;&#187;&nbsp;' + '<a href="/blog-res/blog?' + time_str + '">';
            html += month;
            html += '</a>'
        }

        if(date){
            time_str += '/' + date;
            html += '&nbsp;&#187;&nbsp;' + '<a href="/blog-res/blog?' + time_str + '">';
            html += date;
            html += '</a>'
        }

        //generate the tags
        var tags = nav_info["tags"];
        var tag_op = nav_info["tag-op"];
        var tag_strs = [];

        //generate categories
        if(tag_op && tags && tags.length >0 ) {
            $.each(tags, function(entryIndex, entry){
                var tag_str = '';
                tag_str += '<a href="/blog-res/blog?/tags/' + entry + '">';
                tag_str += entry;
                tag_str += '</a>';
                tag_strs.push(tag_str);
            });
            html += '&nbsp;[TAG:&nbsp;' + tag_strs.join("&nbsp" + tag_op + "&nbsp;") +']';
        }
    }

    $('#navbar').append(html);
}

function gen_categories(){
    var categories_db = json["category-to-blogs-map"];
    var categories = [];

    $.each(categories_db, function(entryIndex, entry){
        var entry_count = 0;
        if(entry && entry.length) entry_count = entry.length;

        categories.push({
            "key": entryIndex,
            "count": entry_count
        });
    });

    categories.sort(function(a, b){
        if(a.key > b.key) return 1;
        else if(a.key == b.key) return 0;
        else return -1;
    });

    var html = '';

    $.each(categories, function(entryIndex, entry){

        var indent_count = 0;

        if(entry.key != "/"){
            var tmp_str = entry.key.replace(/^\//, "");
            tmp_str = tmp_str.replace(/\/$/, "");
            indent_count = tmp_str.split(/\//).length-1;
        } else {
            return;
        }
        html += '<div>';
        html += gen_indent("category-indent", indent_count, false);
        html += '<a href="/blog-res/blog?'+ entry.key +'">' + get_category_name(entry.key) + '</a>';
        html += '&nbsp;(' + entry.count + ')';
        html += gen_indent("", indent_count, true);
        html += '</div>';
    });

    $('#category-body').html(html);
}

/*
* Generate the indent div
*/
function gen_indent(cls, level, is_end){
    var indent_div = "";
    var ret = "";
    if(is_end){
        indent_div = "</div>";
    } else {
        indent_div = "<div class='" + cls + "'>";
    }

    while (level--){
        ret += indent_div;
    }
    return ret;
}

function gen_tags(){
    var tags_db = json["tag-to-blogs-map"];
    var tags = [];
    //var max = Number.MAX_VALUE;
    //var min = Number.MIN_VALUE;
    var max = 1;
    var min = Number.MAX_VALUE;

    $.each(tags_db, function(entryIndex, entry){
        var entry_count = 0;
        if(entry && entry.length) entry_count = entry.length;

        if(entry_count<min) min = entry_count;
        if(entry_count>max) max = entry_count;

        tags.push({
            "key": entryIndex,
            "count": entry_count
        });
    });

    tags.sort(function(a, b){
        if(a.key > b.key) return 1;
        else if(a.key == b.key) return 0;
        else return -1;
    });

    var html = '';

    $.each(tags, function(entryIndex, entry){
        var font_size = 100;
        var max_size_delta = 200;

        //alert("max " + max + "\nmin " + min);

        if(max>min) {
            font_size += Math.floor(max_size_delta * (entry.count - min) / (max-min));
        }

        html += '<span class="tag-class"> &nbsp;';
        html += '<a href="/blog-res/blog?/tags/'+ entry.key + '" ' +
                   'title="'+ entry.count + ' post(s)" ' +
                   'style="white-space: nowrap; font-size: '+ font_size + '%;">'
                   + entry.key + '</a>';
        html += '&nbsp;</span>';

    });

    $('#tag-body').html(html);
}

function gen_archives(){

    var archives_db = json["time-to-blogs-map"];
    var archives = [];

    $.each(archives_db, function(entryIndex, entry){
        var entry_count = 0;
        if(entry && entry.length) entry_count = entry.length;

        archives.push({
            "key": entryIndex,
            "count": entry_count
        });
    });

    archives.sort(function(a, b){
        var akey_year = a.key.substring(0, 4);
        var bkey_year = b.key.substring(0, 4);

        // if(akey_year > bkey_year) return -1;
        // else if(akey_year < bkey_year) return 1;
        // else return 0;
        if(akey_year > bkey_year) return -1;
        else if (akey_year < bkey_year) return 1;
        else {
            if(a.key.length < b.key.length) return -1;
            else if(a.key.length > b.key.length) return 1;
            else {
                // return a.key > b.key;
                if (a.key > b.key) return -1;
                else if (a.key < b.key) return 1;
                else return 0;
            }
        }
    });

    var html = '';

    $.each(archives, function(entryIndex, entry){

        var indent_count = 0;

        if(entry.key != "-"){
            var tmp_str = entry.key.replace(/^-/, "");
            tmp_str = tmp_str.replace(/-$/, "");
            indent_count = tmp_str.split(/-/).length-1;
        } else {
            return;
        }

        if(indent_count > 1) return; //ignore the key with day

        var entry_key_str = entry.key.replace(/-/g, "\/");

        html += gen_indent("archive-indent", indent_count, false);
        html += '<a href="/blog-res/blog?/'+ entry_key_str +'">' + get_archive_name(entry.key) + '</a>';
        html += '&nbsp;(' + entry.count + ')';
        html += gen_indent("", indent_count, true);
    });

    $('#archive-body').html(html);
}

var month_to_str_map = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
}

function get_archive_name(archive_key){
    var str = "";

    var keys = archive_key.split(/-/, 2);

    if(keys && keys.length && keys.length >= 2) {
        var month_key = keys[1];
        keys[1] = month_to_str_map[month_key];
        return keys.join(" ");
    } else {
        return archive_key;
    }
}

function gen_list(nav){
    // 0. if unique, return the whole list
    if(nav["unique"]){
        var list = json["category-to-blogs-map"]["/"];
        if(!list) list = [];
        return list;
    }

    var list_to_merge = [];
    var has_time_or_tags = false;


    // 1. by time
    var time_str = "";
    var year = nav["year"];
    var month = nav["month"];
    var date = nav["date"];

    if(year){
        has_time_or_tags = true;
        time_str += year;
        if(month){
            time_str += "-" + month;
            if(date){
                time_str += "-" + date;
            }
        }
        var list = json["time-to-blogs-map"][time_str];
        if(!list) list = [];
        list_to_merge.push(list);
    }

    // 2. by tag
    var tag_str = "";
    var tags = nav["tags"];
    if(tags && tags.length > 0){
        has_time_or_tags = true;
        var tag_lists = [];
        var tag_op = nav["tag-op"];
        $.each(tags, function(entryIndx, entry){
            var tag_list = json["tag-to-blogs-map"][entry];
            if(!tag_list){
                tag_list = [];
            }
            tag_lists.push(tag_list);
        });
        var list = calculate_list(tag_lists, tag_op);
        list_to_merge.push(list);
    }

    // 3. by category
    var category_str = "";
    var categories = nav["categories"];
    if (categories){
        if(! has_time_or_tags || (categories.length > 0) ) {
            category_str = "/" + categories.join("/");
            var list = json["category-to-blogs-map"][category_str];
            if(!list) list=[];
            list_to_merge.push(list);
        }
    }
    //return the sorted list
    return calculate_list(list_to_merge, "and");
}


function calculate_list(lists, op){
    //lists contains sorted lists
    if(!lists) return [];
    if(lists.length == 1) return lists[0];
    if(op=="and") {
        return calculate_list_and(lists);
    } else if (op=="or") {
        return calculate_list_or(lists);
    } else {
        return []; // should not get here
    }
}

function calculate_list_and(lists){
    var list = lists.shift();
    var tmp = [];
    $.each(lists, function(entryIndex, entry){
        for(var i=0;i<list.length;i++){
            var found = false;
            for(var j=0;j<entry.length;j++){
                if(list[i] == entry[j]){
                    found = true;
                    break;
                }
            }
            if(found) {
                tmp.push(list[i]);
            }
        }

        list = tmp;
        tmp = [];
    });

    return list;
}

function calculate_list_or(lists){
    var tmp = [];
    $.each(lists, function(entryIndex, entry){
        if(entry && entry.length > 0){
            var len = tmp.length;
            for(var j=0;j<entry.length;j++){
                var found = false;
                for(var i=0;i<len;i++){
                    if(entry[j] == tmp[i]){
                        found = true;
                        break;
                    }
                }

                if(!found) tmp.push(entry[j]);
            }
        }
    });

    var blog_map = json["muse-ext-blog-pub-data"];
    //sort
    tmp.sort(function(a, b){
        a_time = blog_map[a]["first-publish-time"];
        b_time = blog_map[b]["first-publish-time"];

        if(a_time[0] > b_time[0]) return -1;
        if((a_time[0] == b_time[0]) && (a_time[1] > b_time[1])) return -1;
        if((a_time[0] == b_time[0]) && (a_time[1] == b_time[1]) && (a_time[2] > b_time[2])) return -1;

        if((a_time[0] == b_time[0]) && (a_time[1] == b_time[1]) && (a_time[2] == b_time[2])) return 0;

        return 1;
    });

    return tmp;
}

function get_entry_date(time_stamp){
    //"Wed Aug 22 13:23:55 2012"
    return time_stamp.substring(0, 10)
        + time_stamp.substring(19, 24);

}

function get_entry_time(time_stamp){
    //"Wed Aug 22 13:23:55 2012"
    return time_stamp.substring(11, 19);
}

function gen_list_html(list){
    var html = "";
    var blog_map = json["muse-ext-blog-pub-data"];
    var index = 0;
    var cur_date = "";
    //alert(list);

    if(!list || list.length == 0) {
        html = "no entries found";
    } else {
        $.each(list, function(entryIndex, entry){
            var title = blog_map[entry].title;
            var time_stamp = blog_map[entry]["time-stamp"];
            var categories = blog_map[entry].categories;
            var tags = blog_map[entry].tags;

            var cur_index = (index++);

            var cur_entry_date = get_entry_date(time_stamp);

            if(cur_date != cur_entry_date){
                cur_date = cur_entry_date;
                html += '<div id="entry-date">' + cur_date + '</div>';
            }

            html += '<hr/>';

            html += '<div class="entry">';
            html += '<a name="entry-'+ cur_index + '"></a>';

            html += '<div class="entry-title">';
            html += '<h2><a href="javascript:go_unique(' + cur_index + ')" >' + title + '</a></h2>';
            html += '</div>';

            html += '<div class="entry-time-stamp">';
            html += 'Posted at: ' + time_stamp;
            html += '</div>';

            if(categories && categories.length > 0){
                html += '<div class="entry-categories">';
                html += 'Category: ';
                var cur_category_str="";
                $.each(categories, function(entryIndex, entry){
                    cur_category_str += "/" + entry;
                    if(entryIndex != 0){
                        html += "&nbsp;&#187;&nbsp;";
                    }
                    html += '<a href="/blog-res/blog?' + cur_category_str + '" >';
                    html += get_category_name(cur_category_str);
                    html += '</a>';
                });
                html += '</div>';
            }

            if(tags && tags.length > 0){
                html += '<div class="entry-tags">';
                html += 'TAG: ';
                $.each(tags, function(entryIndex, entry){
                    if(entryIndex !=0) {
                        html += ", ";
                    }
                    html += '<a href="/blog-res/blog?/tags/' + entry + '" >';
                    html += entry;
                    html += '</a>';
                });

                html += '</div>';
            }

            //permalink
            html += '<div>';
            html += '<a href="/blog-res/blog?/' + entry + '" >' + 'Permanent Link' + '</a>';
            html += '</div>';

            html += '</div>';
        });
    }

    $('#entry-list').html(html);

}

/* return index in the list, or null if search failed */
function bisearch(list, key, func){
    return bisearch_recur(list, 0, list.length-1, key, func);
}

function bisearch_recur(list, start, end, key, func){
    if(start>end) return null;
    var idx = Math.floor((start+end)/2);
    var result = func(list[idx], key);

    if(result == 0) return idx;
    else if (result < 0) {
        return bisearch_recur(list, idx+1, end, key, func);
    } else if (result > 0) {
        return bisearch_recur(list, start, idx-1, key, func);
    }
}

function gen_unique_html(nav){
    var path = nav["file-path"];
    // var idx = 0;
    // while(idx < list.length){
    //     if(list[idx] == path) break;
    //     idx++;
    // }

    var idx = bisearch(list, path,
                       function(akey, bkey){
                           var blog_map = json["muse-ext-blog-pub-data"];
                           var a_time = blog_map[akey]["first-publish-time"];
                           var b_time = blog_map[bkey]["first-publish-time"];

                           if(a_time[0] > b_time[0]) return -1;
                           if((a_time[0] == b_time[0]) && (a_time[1] > b_time[1])) return -1;
                           if((a_time[0] == b_time[0]) && (a_time[1] == b_time[1]) && (a_time[2] > b_time[2])) return -1;
                           if((a_time[0] == b_time[0]) && (a_time[1] == b_time[1]) && (a_time[2] == b_time[2])) return 0;
                           return 1;
                       });

    if(idx != null && idx >= 0 && idx < list.length)
        gen_unique_html_internal(idx, undefined);
    else
        gen_unique_html_internal(list.length, path);
}

/** end of change **/

function gen_unique_html_meta(blog_map, entry){

    var title = blog_map[entry].title;
    var time_stamp = blog_map[entry]["time-stamp"];
    var categories = blog_map[entry].categories;
    var tags = blog_map[entry].tags;
    var html = "";

    html += '<div class="entry">';

    html += '<div class="entry-time-stamp">';
    html += 'Posted at: ' + time_stamp;
    html += '</div>';

    if(categories && categories.length > 0){
        html += '<div class="entry-categories">';
        html += 'Category: ';
        var cur_category_str="";
        $.each(categories, function(entryIndex, entry){
            cur_category_str += "/" + entry;
            if(entryIndex != 0){
                html += "&nbsp;&#187;&nbsp;";
            }
            html += '<a href="/blog-res/blog?' + cur_category_str + '" >';
            html += get_category_name(cur_category_str);
            html += '</a>';
        });
        html += '</div>';
    }

    if(tags && tags.length > 0){
        html += '<div class="entry-tags">';
        html += 'TAG: ';
        $.each(tags, function(entryIndex, entry){
            if(entryIndex !=0) {
                html += ", ";
            }
            html += '<a href="/blog-res/blog?/tags/' + entry + '" >';
            html += entry;
            html += '</a>';
        });

        html += '</div>';
    }

    //permalink
    html += '<div>';
    html += '<a href="/blog-res/blog?/' + entry + '" >' + 'Permanent Link' + '</a>';
    html += "&nbsp;" + WriteSNS("http://mmmyddd.github.io/blog-res/blog?/" + entry, title);

    html += '</div>';

    html += '</div>';
    html += '<hr/>';

    $("#entry-meta").html(html);
}


function gen_unique_html_internal(idx, other_path){

    $('#entry-unique').hide();
    $('#entry-nav').hide();
    window.location.hash="";
    window.location.hash="#top";
    window.scrollTo(0,0);

    var path = "";

    if(idx == list.length){
        path = other_path;
    } else {
        path = list[idx];
    }

    var blog_map = json["muse-ext-blog-pub-data"];
    var title = blog_map[path].title;
    var categories = blog_map[path].categories;
    var category_str = "";
    if(categories){
        category_str = categories.join("/");
    }

    // $("#entry-title").html('<h1>'+title + '</h1>');
    // $("#entry-content").html("Loading ...");
    // gen_unique_html_meta(blog_map, path);

    //alert(JSON.stringify(nav));

    if(ajaxRequest) ajaxRequest.abort();

    ajaxRequest= $.get("/blog-res/" + path + ".txt", {}, function(data){

        ajaxRequest = null;

        //moved in begin
        $("#entry-title").html('<h1>'+title + '</h1>');
        $("#entry-content").html("Loading ...");
        gen_unique_html_meta(blog_map, path);
        //moved in end

        //remove meta data parts
        var html = data.replace(/^#tags.*$/m, "");
        //remove title
        html = html.replace(/^.*\n/, "");
        //fix the res parts
        html = html.replace(/src="\.\/res\/(.*?)"/g, 'src="/blog-res/' + category_str + '/res/$1"');
        html = html.replace(/href="\.\/res\/(.*?)"/g, 'href="/blog-res/' + category_str + '/res/$1"');
        html = html.replace(/src="\.\/latex\/(.*?)"/g, 'src="/blog-res/' + category_str + '/latex/$1"');
        html = html.replace(/href="\.\/latex\/(.*?)"/g, 'href="/blog-res/' + category_str + '/latex/$1"');

        //fix the syntax highlight
        html = html.replace(/<code\s+?config=(.*?)>([\S\s]*?)<\/code>/g,
                            function(str, config, content){
                                return "<pre class=" + config + ">" + content + "</pre>";
                            });

        //disqus
        html += genDisqus_comment_content(path, title);

        $("#entry-content").html(html);
        SyntaxHighlighter.highlight();

        if(idx != list.length){
            //moved in
            if(idx != 0){ // not newest
                var next_title = blog_map[list[idx-1]].title;
                $("#entry-next").html(next_title);
                $("#entry-next-container").show();
                $("#entry-next").click(function(){
                    go_unique(idx-1);
                });

                $("#float-next-container").show();
                $("#float-link-next").click(function(){
                    go_unique(idx-1);
                });
                $("#float-link-next").attr({title: "Newer Post: "+ next_title});
            } else {
                $("#entry-next-container").hide();
                $("#float-next-container").hide();
            }

            if(idx != list.length-1){ // not the earliest
                var pre_title = blog_map[list[idx+1]].title;
                $("#entry-pre").html(pre_title);
                $("#entry-pre-container").show();
                $("#entry-pre").click(function(){
                    go_unique(idx+1);
                });

                $("#float-pre-container").show();
                $("#float-link-pre").click(function(){
                    go_unique(idx+1);
                });
                $("#float-link-pre").attr({title: "Older Post: " + pre_title});

            } else {
                $("#entry-pre-container").hide();
                $("#float-pre-container").hide();
            }

            $("#entry-back").click(function(){
                go_list(idx);
            });
            $("#float-link-back").click(function(){
                go_list(idx);
            });

        } else {
            $("#entry-pre-container").hide();
            $("#entry-next-container").hide();
            $("#entry-back").click(function(){
                go_list(idx);
            });
            $("#float-pre-container").hide();
            $("#float-next-container").hide();
            $("#float-link-back").click(function(){
                go_list(idx);
            });
        }
        // moved in end

        $("#entry-unique").show();
        $('#entry-nav').show();
        $('#float-unique-container').show();
    }); /*.error(function(jqXHR){

        ajaxRequest = null;

        //moved in begin
        $("#entry-title").html('<h1>'+title + '</h1>');
        $("#entry-content").html("<div id='error'>Error: Can not load the blog entry content.</div>");
        gen_unique_html_meta(blog_map, path);
        //moved in end

        if(idx != list.length){
            //moved in
            if(idx != 0){ // not newest
                var next_title = blog_map[list[idx-1]].title;
                $("#entry-next").html(next_title);
                $("#entry-next-container").show();
                $("#entry-next").click(function(){
                    go_unique(idx-1);
                });
            } else {
                $("#entry-next-container").hide();
            }

            if(idx != list.length-1){ // not the earliest
                var pre_title = blog_map[list[idx+1]].title;
                $("#entry-pre").html(pre_title);
                $("#entry-pre-container").show();
                $("#entry-pre").click(function(){
                    go_unique(idx+1);
                });
            } else {
                $("#entry-pre-container").hide();
            }

            $("#entry-back-container").click(function(){
                go_list(idx);
            });
        } else {
            $("#entry-pre-container").hide();
            $("#entry-next-container").hide();
            $("#entry-back-container").click(function(){
                go_list(idx);
            });
        }
        // moved in end
        $("#entry-unique").show();
        $('#entry-nav').show();
    });*/
}

function go_unique(idx){
    $('#entry-list-view').hide();
    gen_unique_html_internal(idx);
    //$('#entry-unique').show();
}

function go_list(idx){
    $('#entry-unique').hide();
    $('#entry-list-view').show();
    $('#float-unique-container').hide();

    //move window to hash
    if(idx != list.length){
        window.location.hash="#entry-" + idx;
    } else {
        window.location.hash="";
    }
}

function get_links(url, w){
    $.get(url, {}, function(data){
        var html = "";

        //remove title
        var tmp = data.replace(/^.*\n/, "");
        //remove empty lines
        tmp = tmp.replace(/^\s*$/, "");
        tmp = tmp.replace(/^\s*/, "");
        tmp = tmp.replace(/\s*$/, "");

        var links = tmp.split(/\n/);

        $.each(links, function(entryIndx, entry){
            var parts = entry.split(/:=/);
            if(parts && parts.length == 2){
                html += '<div class="my-link">';
                html += '<a href="'+ parts[1] +'">' + parts[0] + '</a>';
                html += '</div>';
            }
        });

        $("#"+w+"-body").html(html);
        $("#widget-" + w).show();
    });
}


// social share
function WriteSNS(page_url, page_content) {
    var html = "";
    html += '<div class="social-div">';
    html += ShareCode("http://v.t.sina.com.cn/share/share.php?title={title}&url={url}",
                      "0",
                      //"http://t.sina.com.cn/favicon.ico",
                      "转发到新浪微博",
                      page_url, "@mmmyddd - Blog: " + page_content);

     html += ShareCode("http://www.douban.com/recommend/?url={url}&title={title}",
                       "-112",
                       //"http://t.douban.com/favicon.ico",
                       //"/blog-res/res/douban.png",
                       "推荐到豆瓣",
                       page_url, page_content);

    html += ShareCode("http://share.renren.com/share/buttonshare.do?title={title}&link={url}",
                      "-32",
                      //"http://s.xnimg.cn//favicon-rr.ico",
                      "转帖到人人网",
                      page_url, page_content);

    html += ShareCode("http://apps.hi.baidu.com/share/?title={title}&url={url}",
                      "-176",
                      //"http://www.baidu.com/favicon.ico",
                      "转帖到百度空间",
                      page_url, page_content);

    html += ShareCode("http://www.kaixin001.com/repaste/share.php?rtitle={title}&rurl={url}",
                      "-16",
                      //"http://img1.kaixin001.com.cn/i/favicon/favicon1.ico",
                      "转贴到开心网",
                      page_url, page_content);

    html += ShareCode("http://www.facebook.com/sharer/sharer.php?u={url}&t={title}",
                      "-592",
                      "Share to Facebook",
                      page_url, page_content);
    html += ShareCode("http://twitter.com/intent/tweet?text={title}&url={url}&via=mmmyddd",
                      "-624",
                      "Share to Twitter",
                      page_url, page_content);
    html += ShareCode("http://www.linkedin.com/shareArticle?&url={url}&title={title}&summary=&source=",
                      "-960",
                      "Share to LinkIn",
                      page_url, page_content);
    html += ShareCode("https://plus.google.com/share?url={url}&text={title}",
                      "-1040",
                      "Share to Google+",
                      page_url, page_content);
    html += '</div>';
    return html;
}

function ShareCode(server_url,/*server_icon_url*/ypos,text, page_url, page_content){
    var title = encodeURIComponent(page_content);
    var url = encodeURIComponent(page_url);

    server_url = server_url.replace("{title}",title);
    server_url = server_url.replace("{url}",url);

    //alert(server_url);

    return '<a class="social-link" title="' + text + '" href="javascript:window.open(\''
        + server_url
        +'\',\'_blank\',\'scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes\');void 0;"'
        +' style="color:#000000;text-decoration:none;font-size:12px;font-weight:normal">'
        + '<span class="social" style=\"background-position: 0px ' + ypos + 'px;\" />'
        + "</a>";
}
function fillsearch(){
    var outer = document.getElementById("gsearch");
    outer.innerHTML =
          "<input type=\"hidden\" name=\"cx\" value=\"005444793828600865576:qmbd79za6di\" />" +
          "<input type=\"hidden\" name=\"ie\" value=\"UTF-8\" />" +
          "<input style=\"border: 1px solid rgb(126, 157, 185); padding: 2px;" +
                        "background: rgb(255, 255, 255)" +
                        "url(http://www.google.com/coop/images/google_custom_search_watermark.gif)" +
                        "no-repeat scroll left center;\" name=\"q\" size=\"16\" type=\"text\" />"  +
        "<script type=\"text/javascript\" src=\"http://www.google.com/coop/cse/brand?form=cse-search-box&amp;lang=en\"></script>";
}


function genDisqus_comment_content(id, title){
    //alert(title + "::" + id);
    var dsq = document.getElementById("disqus");

    if(dsq) {
        dsq.parentElement.removeChild(dsq); // remove the previous script\
        //console.log("removed");
    }

    return '<div align="right">(<i>End</i>)</div>\n' +
        '<div id="disqus_thread" style="margin-top:50px"></div>\n' +
        '<script type="text/javascript"\n>' +
        '/* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */\n' +
        "var disqus_shortname = 'justinswebsite'; // required: replace example with your forum shortname\n" +
        "var disqus_identifier = '" + "blog:" + id + "';\n" +
        "var disqus_title = \"" + "Justin's Blog - " + title + "\";\n" +
        "var disqus_url = '" + "http://mmmyddd.github.io/blog-res/blog?/" + id + "';\n" +
        "/* * * DON'T EDIT BELOW THIS LINE * * */\n" +
        "(function() { \n" +
        "var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;\n" +
        "dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';\n" +
        "dsq.id='disqus';\n" +
        "(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);\n" +
        "})();\n" +
        "</script>\n" +
        '<noscript>Please enable JavaScript to view the <a href="http://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>\n' +
        '<a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>\n';

}
