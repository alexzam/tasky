function Task(id, parentId) {
    this.id = id;
    this.label = '';
    this.x = 100;
    this.y = 100;
    this.marked = false;
    this.page = false;
    this.parent = parentId;
    this.subs = [];
}

Task.prototype.merge = function(source) {
    for (i in source) {
        if (i == 'id') continue;
        if (i == 'subs') {
            // TODO Merge subtasks
            continue;
        }

        this[i] = source[i];
    }
};

var tasky = {
    newid: 1,
    outBuffer: [],
    dragging: false,

    addTopTaskButton: function() {
        var newt = new Task(-1, global.rootId);
        newt.label = 'New Task';
        var tid = tasky.addTopTask(newt);
        tasky.addInsertToBuffer(newt, tid);
        return false;
    },

    addTopTask: function(task) {
        var marked = (task.marked) ? ' marked' : 'unmarked';
        var tid = 't' + tasky.newid;

        var item = $('#toptask-template')
            .clone()
            .attr('id', tid)
            .attr('tid', task.id).addClass(marked)
            .removeClass('hidden')
            .css({left:task.x + 'px', top:task.y + 'px'})
            .appendTo('.playground')
            .draggable({distance:3})
            .bind('dragstop', {tid:task.id}, tasky.topTaskDrag)
            .mouseout();
        item.children('span')
            .text(task.label);
        item.data('t', task);
        tasky.makeListDroppable(item.find('.tasklist'));
            
        tasky.newid++;
        for (var i in task.subs) {
            tasky.addSubTask(item, false, task.subs[i]);
        }
        return tid;
    },

    topTaskDrag: function(e, ui) {
        var item = $(e.target);

        var task = item.data().t;
        task.x = ui.position.left;
        task.y = ui.position.top;

        $('#msg').text('ID: ' + e.data.tid + ', X: ' + task.x + ', y: ' + task.y);
        item.click();

        //tasky.addUpdateToBuffer(task);
    },

    makeListDroppable:function(list){
        list.droppable({
		accept:'.task', 
		hoverClass:'drop-target-hl', 
		activate:function(){
			tasky.dragging = true;
		},
		deactivate:function(){
			tasky.dragging = false;
		},
		over:function(){
			$(this).find('.hiding-drag').show();
		},
		out:function(){
			$(this).find('.hiding-drag').hide();
		},
		drop:tasky.dropTaskToList
	    });
    },

    saveLabel: function(e) {
        var inp = $(this);
        var val = inp.val();
        var item = inp.closest('.task');
        item.find('.title').text(val).show();
        inp.remove();
        var task = item.data().t;
        task.label = val;

        tasky.addUpdateToBuffer(task);
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
        $(this).removeClass('selected').children('.hiding').hide();
        $(this).find('.hiding-drag').hide();
    },

    taskDeselect: function(e) {
        $(this).removeClass('selected').children('.hiding').hide();
        $(this).find('.hiding-drag').hide();

        return false;
    },

    topTaskSelect: function(e) {
        $(this)
            .addClass('selected')
            .children('.hiding').show();
    },

    taskSelect: function(e) {
        $(this)
            .addClass('selected')
            .children('.hiding').show();
    },

    addSubTask: function(item, manual, task) {
        var tid = 't' + tasky.newid;
        var marked = (task.marked) ? ' marked' : 'unmarked';

        var newi = $('#subtask-template')
            .clone()
            .attr('id', tid)
            .attr('tid', task.id)
            .addClass(marked)
            .data('t', task)
            .mouseout();
        item.children('.tasklist').removeClass('hiding-drag').removeClass('hidden')
            .children().last().before(newi);
        newi.children('.title')
            .text(task.label);
        item.children('.but-fold')
            .show();

	tasky.makeListDroppable(item.children('.tasklist'));

        tasky.newid++;
        if (manual) newi.children('.title').dblclick();
        else for (var i in task.subs) {
            tasky.addSubTask(newi, false, task.subs[i]);
        }

        return tid;
    },

    newTaskClick: function(e) {
        var task = $(this).parents('.task').first();
	var butFold=task.children('.but-fold');
	if(!butFold.hasClass('minus')){
            butFold.click();
        }
        $('#msg').text('New task within ' + task.attr('tid'));
        var newt = new Task(-1, task.data().t.id);
        newt.label = 'New Subtask';
        var tid = tasky.addSubTask(task, true, newt);
        tasky.addInsertToBuffer(newt, tid);
    },

    markTask: function(e) {
        var item = $(this).closest('.task')
            .toggleClass('marked')
            .toggleClass('unmarked');
        var task = item.data().t;
        task.marked = (item.hasClass('marked'));

        tasky.addUpdateToBuffer(task);

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

    addInsertToBuffer: function(task, tid) {
        task.tid = tid;
        tasky.outBuffer.push({act:'i', task: task});
    },

    addUpdateToBuffer: function(task) {
        tasky.outBuffer.push({act:'u', id:task.id, task: task});
    },

    addDeleteToBuffer: function(id) {
        tasky.outBuffer.push({act:'d', id: id});
    },

    sendUpdates: function() {
        var data = [];

        while (tasky.outBuffer.length > 0) {
            // Do not post update events for task that was not yet added
            if (tasky.outBuffer[0].act == 'u' && tasky.outBuffer[0].id == -1) break;
            data.push(tasky.outBuffer.shift());
        }

        if (data.length > 0) {
            data = {data: data};
            $.post(
                'play/update',
                data,
                function(data, status) {
                    for (i in data) {
                        var ditem = data[i];
                        if (ditem == null) continue;

                        console.log('Incoming update of type ' + ditem.type);
                        if (ditem.type == 'i') {
                            console.log('Changing id ' + ditem.o + ' to ' + ditem.n);
                            var item = $('.playground')
                                .find('.task[id=' + ditem.o + ']');
                            item.attr('tid', ditem.n);
                            item.data().t.id = ditem.n;
                            for (j in tasky.outBuffer) {
                                if (tasky.outBuffer[j].id == ditem.o) tasky.outBuffer[j].id = ditem.n;
                            }
                        }
                    }
                },
                'json'
                );
        } else console.log("No data");

        setTimeout('tasky.sendUpdates()', 500);
    },

    createTaskFromData:function(ditem, parent) {
        var task = new Task(ditem.id, (parent == null) ? global.rootId : parent);
        task.merge(ditem);
        for (var i in ditem.subs) {
            var subtask = tasky.createTaskFromData(ditem.subs[i], ditem.id);
            task.subs.push(subtask);
        }

        return task;
    },

    dropTaskToList:function(event, ui){
    }
};

// Initialization                                                                                 
$(function() {
    $('.playground')
        .delegate('.toptask', 'mouseenter', tasky.topTaskSelect)
        .delegate('.toptask', 'mouseleave', tasky.topTaskDeselect)
        .delegate('.task:not(.toptask)', 'mouseenter', tasky.taskSelect)
        .delegate('.task:not(.toptask)', 'mouseleave', tasky.taskDeselect);

    $.getJSON('play/get-task-page', {id:global.rootId}, function(data) {
        for (var i in data) {
            var ditem = data[i];
            var item = tasky.createTaskFromData(ditem);
            tasky.addTopTask(item);
        }
    });

    $('#but-topadd').click(tasky.addTopTaskButton).droppable({accept:'.task', activeClass:'drop-target-hl', activate:function(){console.log('active')}});;
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
    $('.but-fold').live('click', tasky.foldList);
    $('.but-add').live('click', tasky.newTaskClick);

    setTimeout('tasky.sendUpdates()', 500);
});