var notes;
var total;
var months = { 
    1:'January',
    2:'February',
    3:'March',
    4:'April',
    5:'May',
    6:'June',
    7:'July',
    8:'August',
    9:'September',
    10:'October',
    11:'November',
    12:'December'
};

// load in the notes for the left hand column
function LoadNotes(result) {
	// console.log(result);
	if(result == undefined) {
		// console.log("load notes total: " + total)
		notes = []
		AddNote()
	}
	else {
		notes = result['notes'];
		if(notes.length == 0) {
			AddNote()
		}
		else {
			// sorting notes by time, most recent first
			notes.sort(function(a, b) {
			    a = new Date(a['date']);
			    b = new Date(b['date']);
			    return a>b ? -1 : a<b ? 1 : 0;
			});

			// console.log(notes)
			var toDelete = [];
			var noteReached = false;
			for (i=0; i<notes.length; i++) {
				var date = new Date(notes[i]['date'])
				var text = notes[i]['contents']
				if (text != '') {
				    var individual_note = $('<li note-id="' + notes[i]['id'] + '" class="note"><div class="note-text">' + notes[i]['contents'] + '</div><div class="date">' + FormatDate(GetDate(date), 'date') + '</div></li>')
				   	if(!noteReached) {
				   		// just call the other function
				    	individual_note.addClass('active')
				    	$('#edit-note').val(notes[i]['contents'])
				    	$('#edit-note').attr('note-id', notes[i]['id'])
						var strDateTime = FormatDate(GetDate(date), 'full')
						$('#header-time').text(strDateTime)
						noteReached = true;
				    }
				    
				    $('#notes-list').append(individual_note)
					$('.note').click(function() {
						SelectNote($(this).attr('note-id'))
					})
				}
				else {
					toDelete.push(i)
				}
			}
			for(i=0; i<toDelete.length; i++) {
				notes.splice(i, 1);
			}
			chrome.storage.sync.set({'total':total, 'notes':notes})	
		}
	}
}

// switch to another note
function SelectNote(id, is_new) {
	$('.active').removeClass('active-alt');
	$('.active').removeClass('active');
	$('[note-id="' + id + '"]').addClass('active');
	$('#edit-note').attr('note-id', id);
	if (typeof is_new === 'undefined') {
		var result = $.grep(notes, function(e){ return e.id == id; })[0];
		var text = '';
		var date = new Date();
		if(result !== undefined) {
			text = result['contents'];
			date = new Date(result['date']);
		}
		$('#edit-note').val(text);
		var strDateTime = FormatDate(GetDate(date), 'full')	;
	}
	else {
		$('#edit-note').val('');
		var strDateTime = FormatDate(GetDate(), 'full');
	}
	$('#header-time').text(strDateTime);
}

function SaveNote() {
	var text = $('#edit-note').val()
	var id = $('#edit-note').attr('note-id')

	index = _.findIndex(notes, function(e) { return e.id == id })
	if(index == -1) {index == 0}

	// updating sync storage
	var date = new Date();
	if (notes[index] === undefined) {
		notes.push({'id':total, 'date': String(date), 'contents':text})
	}
	else {
		notes[index]['contents'] = text
		notes[index]['date'] = String(date);
	}
	// console.log(" save note total: " + total)
	// console.log("notes: " + notes)
	chrome.storage.sync.set({'total':total, 'notes':notes})

	// updating front end
	$('#header-time').text(FormatDate(GetDate(), 'full'))
	$('#notes-list').prepend($('#notes-list').find('[note-id="' + id + '"]'));
	$('#notes-list').find('[note-id="' + id + '"]').find('.date').text(FormatDate(GetDate(), 'date'))	
	if(text != '') {
		$('#notes-list').find('[note-id="' + id + '"]').find('.note-text').text(text)
	}
	else {
		$('#notes-list').find('[note-id="' + id + '"]').find('.note-text').text('New Note')
	}
}

function AddNote() {
	if ($('.note').first().find('.note-text').text() != "New Note") {
		// console.log("Add")
		total = total + 1
		// console.log("add note total: " + total)

		// adding in frontend
		var dateArray = GetDate()
		var new_note = $('<li note-id="' + total + '" class="note"><div class="note-text">' + 'New Note' + '</div><div class="date">' + FormatDate(dateArray, 'date') + '</div></li>')
		$('#notes-list').prepend(new_note)
		new_note.click(function() {
			SelectNote($(this).attr('note-id'))
		})
		SelectNote(total, true)
	}	
	// not adding in backend yet because I only want to save it if the user types something
}

function DeleteNote(id) {
	// console.log("Delete");
	if ($('.note.active').find('.note-text').text() != "New Note") {
		// deleting in backend
		index = _.findIndex(notes, function(e) { return e.id == id })
		notes.splice(index, 1)
		chrome.storage.sync.set({'total':total, 'notes':notes})
		// deleting in frontend
		if ($('.note').length == 1) {
			AddNote()
		}
		else {
			var switch_id = $('#notes-list').find('[note-id="' + id + '"]').prev().attr('note-id')
			if (switch_id === undefined) {
				switch_id = $('#notes-list').find('[note-id="' + id + '"]').next().attr('note-id')
			}
			SelectNote(switch_id)
		}
		$('#notes-list').find('[note-id="' + id + '"]').remove()
	}
}

// gets array with all info about date
// edited from http://stackoverflow.com/questions/4744299/how-to-get-datetime-in-javascript
function GetDate(now) {
	if (typeof now === 'undefined') { now = new Date(); }
	var dateArray = [now.getMonth() + 1, AddZero(now.getDate()), now.getFullYear(), FixHours(now.getHours()), AddZero(now.getMinutes()), now.getHours() >= 12 ? "PM" : "AM"]

	// Pad given value to the left with "0"
	function AddZero(num) {
	    return (num >= 0 && num < 10) ? "0" + num : num + "";
	}
	// 12 hour clock 
	function FixHours(num) {
		if(num == 0) {
			return 12;
		}
		return (num > 12) ? num-12 : num;
	}
	return dateArray
}

// formats date in either mm/dd/yy or mm dd, yy, hour:min AM/PM
function FormatDate(dateArray, type) {
	if (type == 'date') {
		var strDateTime = dateArray[0] + "/" + dateArray[1] + "/" + dateArray[2]
	}
	else {
		var strDateTime = months[dateArray[0]] + " " + dateArray[1] + ", " + dateArray[2] + ", " + dateArray[3] + ":" + dateArray[4] + " " + dateArray[5]
	}
	return strDateTime
}

function Search() {
	var search = $('#search-notes').val().toLowerCase()
	$('.note').each(function() {
		// console.log(search)
		// console.log($(this).find('.note-text').text());
		// console.log($(this).find('.note-text').text().toLowerCase().indexOf(search))    
		if ($(this).find('.note-text').text().toLowerCase().indexOf(search) === -1) {
			$(this).hide()
		}
		else {
			$(this).show()
		}
	})
}

// start
document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.sync.get('total', function(result) {
		total = result['total'];
		// console.log("start total: " + total);
		if(total === undefined) {
			total = 0;
			LoadNotes()
		}
		else {
			chrome.storage.sync.get('notes', function(result) {
				console.log(result);
				LoadNotes(result);
			})		
		}
	})



	$('#search-notes').on('keyup', function() {
		_.debounce(Search(), 300)
	})

	$('#edit-note').on('keyup', function() {
		_.debounce(SaveNote(), 300)
	})
	$('#edit-note').click(function() {
		$('.active').addClass('active-alt')
	})

	$('.add-note').click(function() {
		AddNote()
	})
	$('.delete-note').click(function() {
		DeleteNote($('#edit-note').attr('note-id'))
	})

})

// chrome.storage.sync.set({'total':3, 'notes':[{'id':1, 'date':"Tue Sep 01 2015 00:13:15 GMT-0400 (EDT)", 'contents':'swag'}, {'id':2, 'date':"Tue Sep 01 2015 00:13:43 GMT-0400 (EDT)", 'contents':'sdfdsfsdf'}, {'id':3, 'date':"Tue Sep 01 2015 00:13:30 GMT-0400 (EDT)", 'contents':'fuk'}]})


// var lines = textarea.value.replace(/\r\n/g, "\n").split("\n");



