var tasky = {
    newid: 1,
    outBuffer: [],
    
    getTById: function(id) {
        var item;
        for (var i in tasky.data) {
            item = tasky.data[i];
            if (item.id == id) return item;
        }
        return null;
    },

    getIById: function(id) {
        return $('#t' + id);
    },
    
    topTaskDrag: function(e, ui) {
        // TODO Review
        $('#msg').text('ID: ' + e.data.tid + ', X: ' + ui.position.left + ', y: ' + ui.position.top);
        $(e.target).click();
    },

    saveLabel: function(e) {
        var inp = $(this);
        inp.closest('.task').find('.title').text(inp.val()).show();
        inp.remove();
    },

    labelKeyUp: function(e) {
        if (e.keyCode == 13) $(this).blur();
    },

    editLabel: function(e) {
        var item = $(this).closest('.task');
        var txt = item.find('.title').hide().text();
        item.prepend($('<input>')
                .attr('type', 'text')
                .val(txt)
                .blur(tasky.saveLabel)
                .keyup(tasky.labelKeyUp)
                );
        item.children('input').focus();
    },

    topTaskDeselect: function(e) {
        $(this).removeClass('selected')
                .find('.hiding').hide();
        $(this).find('.hiding2').hide();
    },

    taskDeselect: function(e) {
        $(this).children('.hiding2').addClass('hide');
        $(this).children('.tasklist').children('.hiding2').addClass('hide');

        return false;
    },

    topTaskSelect: function(e) {
        $(this)
                .addClass('selected')
                .find('.hiding').show();
        $(this).find('.hiding2').show();
    },

    taskSelect: function(e) {
        $(this).children('.hiding2').removeClass('hide');
        $(this).children('.tasklist').children('.hiding2').removeClass('hide');
    },

    addTopTask: function(task) {
        var marked = (task.marked) ? ' marked' : 'unmarked';
        var tid = 't' + tasky.newid;

        var item = $('#toptask-template')
                .clone()
                .attr('id', tid)
                .attr('tid', task.id)
                .addClass(marked)
                .removeClass('hidden')
                .offset({left:task.x, top:task.y})
                .appendTo('.playground')
                .draggable({distance:3})
                .bind('dragstop', {tid:task.id}, tasky.topTaskDrag)
                .mouseout();
        item.children('span')
                .text(task.label);
        item.data('t', task);
        tasky.newid++;
        for(var i in task.subs){
            tasky.addSubTask(item, false, task.subs[i]);
        }
        return tid;
    },

    addSubTask: function(item, manual, task) {
        var marked = (task.marked) ? ' marked' : 'unmarked';
        var newi = $('#subtask-template')
                .clone()
                .attr('id', 't' + task.id)
                .addClass(marked);
        item.children('.tasklist').children().last().before(newi);
        newi.children('.title')
                .text(task.label);
        item.children('.but-fold')
                .show();
        newi.data('t', task);
        if(manual) newi.children('.title').dblclick();
        else for(var i in task.subs){
            tasky.addSubTask(newi, false, task.subs[i]);
        }
    },

    newTaskClick: function(e) {
        var task = $(this).parents('.task').first();
        $('#msg').text('New task within ' + task.attr('tid'));
        var id = tasky.newid;
        var newt = {id:"t"+id, label:"New Subtask", marked:false,sub:[]};
        tasky.newid++; // TEMP
        tasky.addSubTask(task, true, newt);
        tasky.addInsertToBuffer(newt);
        $(this).parents('.tasklist').removeClass('hiding2');
    },
    
    markTask: function(e) {
        $(this).closest('.task')
                .toggleClass('marked')
                .toggleClass('unmarked');
        return false;
    },

    foldList: function(e) {
        var tasklist = $(this).closest('.task').children('.tasklist');
        
        if ($(this).hasClass('minus')) {
            $(this)
                    .removeClass('minus')
                    .text('+');
            tasklist.hide();
        } else {
            $(this)
                    .addClass('minus')
                    .text('-');
            tasklist.show();
        }
    },

    addInsertToBuffer: function(task, tid){
        task.tid = tid;
        tasky.outBuffer.push({act:'i', task: task});
    },

    addUpdateToBuffer: function(task){
        tasky.outBuffer.push({act:'u', id:task.tid, task: task});
    },

    addDeleteToBuffer: function(id){
        tasky.outBuffer.push({act:'d', id: id});
    },

    sendUpdates: function(){
        var data = [];

        while(tasky.outBuffer.length > 0){
            // Do not post update events for task that was not yet added
            if (tasky.outBuffer[0].act == 'u' && tasky.outBuffer[0].id.charAt(0) == 't') break;
            data.push(tasky.outBuffer.shift());
        }

        if(data.length > 0){
            data = {data: data};
            console.dir(data);
            $.post(
                'play/update', 
                data, 
                function(data, status){
                    for(i in data){
                        var ditem = data[i];
                        if(ditem == null) continue;

                        console.log('Incoming update of type '+ditem.type);
                        if(ditem.type == 'i'){
                            console.log('Changing id '+ditem.o+' to '+ditem.n);
                            $('.playground')
                                .find('.task[id='+ditem.o+']')
                                .attr('tid', ditem.n);
                            for(j in tasky.outBuffer){
                                if(tasky.outBuffer[j].id == ditem.o) tasky.outBuffer[j].id = ditem.n;
                            }
                        }
                    }
                }, 
                'json'                                                                              
            );                                                                                   
        } else console.log("No data");                                                           
                                                                                                 
        setTimeout('tasky.sendUpdates()', 500);                                                  
    }                                                                                            
};                                                                                                
                                                                                                 
// Initialization                                                                                 
$(function() {                                                                                    
    $('.playground')                                                                           
            .delegate('.toptask', 'mouseenter', tasky.topTaskSelect)                           
            .delegate('.toptask', 'mouseleave', tasky.topTaskDeselect)                         
            .delegate('.task', 'mouseenter', tasky.taskSelect)                                 
            .delegate('.task', 'mouseleave', tasky.taskDeselect);

    $.getJSON('play/get-task-page', {id:global.rootId}, function(data){
        for (var i in data) {
            tasky.addTopTask(data[i]);
        }
    });
    
    $('#but-topadd').click(function() {
        var id = tasky.newid;
        var newt = {id:-1, label:"New Task", x:100, y:100,marked:false,sub:[]};
        var tid = tasky.addTopTask(newt);
        tasky.addInsertToBuffer(newt, tid);
        return false;
    });
    $('.toptask').mouseleave();
    // TODO Deletion
    //    $('#but-locdel').click(function() {
    //        curItem
    //                .fadeOut()
    //                .queue(function() {
    //            $(this).remove().dequeue();
    //        });
    //        $('.playground').click();
    //        return false;
    //    });

    $('.title').live('dblclick', tasky.editLabel);
    $('.but-mark').live('click', tasky.markTask);
    $('.newtask').live('click', tasky.newTaskClick);
    $('.but-fold').live('click', tasky.foldList);

    setTimeout('tasky.sendUpdates()', 500);
});