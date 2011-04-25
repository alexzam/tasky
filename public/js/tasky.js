// Test data
var data = [
    {id:0, label:"aaa", x:100, y:100, marked:false,sub:[]},
    {id:1, label:"bbb", x:200, y:200, marked:false,sub:[]},
    {id:2, label:"ccc", x:300, y:300, marked:true,sub:[]},
    {id:3, label:"ddd", x:400, y:400, marked:false,sub:[]}
];

var newid = 4;

function getTById(id) {
    var item;
    for (var i in data) {
        item = data[i];
        if (item.id == id) return item;
    }
    return null;
}

function getIById(id) {
    return $('#t' + id);
}

function topTaskDrag(e, ui) {
    // TODO Review
    $('#msg').text('ID: ' + e.data.tid + ', X: ' + ui.position.left + ', y: ' + ui.position.top);
    $(e.target).click();
}

function saveLabel(e) {
    var inp = $(this);
    inp.closest('.task').find('.title').text(inp.val()).show();
    inp.remove();
}

function labelKeyUp(e) {
    if (e.keyCode == 13) $(this).blur();
}

function editLabel(e) {
    var item = $(this).closest('.task');
    var txt = item.find('.title').hide().text();
    item.prepend($('<input>')
            .attr('type', 'text')
            .val(txt)
            .blur(saveLabel)
            .keyup(labelKeyUp)
            );
    item.children('input').focus();
}

function topTaskDeselect(e) {
    $(this).removeClass('selected')
            .find('.hiding').hide();
    $(this).find('.hiding2').hide();
}

function taskDeselect(e) {
    $(this).children('.hiding2').addClass('hide');
    $(this).children('.tasklist').children('.hiding2').addClass('hide');

    return false;
}

function topTaskSelect(e) {
    $(this)
            .addClass('selected')
            .find('.hiding').show();
    $(this).find('.hiding2').show();
}

function taskSelect(e) {
    $(this).children('.hiding2').removeClass('hide');
    $(this).children('.tasklist').children('.hiding2').removeClass('hide');
}

function addTopTask(task) {
    var marked = (task.marked) ? ' marked' : 'unmarked';
    var item = $('#toptask-template')
            .clone()
            .attr('id', 't' + task.id)
            .attr('tid', task.id)
            .addClass(marked)
            .removeClass('hidden')
            .offset({left:task.x, top:task.y})
            .appendTo('.playground')
            .draggable({distance:3})
            .bind('dragstop', {tid:task.id}, topTaskDrag)
            .mouseout()
            ;
    item.children('span')
            .text(task.label);
}

function addSubTask(item, manual, task) {
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
    newi.children('.title').dblclick();
}

function newTaskClick(e) {
    var task = $(this).parents('.task').first();
    $('#msg').text('New task within ' + task.attr('tid'));
    var id = newid;
    var newt = {id:id, label:"New Subtask", marked:false,sub:[]};
    newid++; // TEMP
    addSubTask(task, true, newt);
    $(this).parents('.tasklist').removeClass('hiding2');
}

function markTask(e) {
    $(this).closest('.task')
            .toggleClass('marked')
            .toggleClass('unmarked');
    return false;
}

function foldList(e) {
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
}

// Initialization
$(function() {
    $('.playground')
            .delegate('.toptask', 'mouseenter', topTaskSelect)
            .delegate('.toptask', 'mouseleave', topTaskDeselect)
            .delegate('.task', 'mouseenter', taskSelect)
            .delegate('.task', 'mouseleave', taskDeselect);
    for (var i in data) {
        addTopTask(data[i]);
    }
    $('#but-topadd').click(function() {
        var id = newid;
        var newt = {id:id, label:"New Task", x:100, y:100,marked:false,sub:[]};
        newid++; // TEMP
        addTopTask(newt);
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

    $('.title').live('dblclick', editLabel);
    $('.but-mark').live('click', markTask);
    $('.newtask').live('click', newTaskClick);
    $('.but-fold').live('click', foldList);
});