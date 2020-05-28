var _data_array_widget_row_content = `
    <fieldset class="form-group position-relative" data-array-row>
        <input class="form-control mb-1">
        <div class="form-control-position">
            <i class="la la-times danger font-medium-5" data-array-remove-row></i>
        </div>
    </fieldset>
`;

var _data_array_widget_add = `<button class="btn btn-secondary mb-2" type="button"><i class="ft-plus"></i> Add</button>`;


function ArrayWidget(element) {
    // https://schinckel.net/2017/04/01/javascript-array-widget/
    // We need to be able to reset the value to the initial, if our form
    // gets told to reset.
    var initialValue = element.value;

    var rowTemplate = document.createElement('template');
    rowTemplate.innerHTML = _data_array_widget_row_content;
    var buttonTemplate = document.createElement('template');
    buttonTemplate.innerHTML = _data_array_widget_add;

    // Wrap the whole widget inside a fieldset, as it enables us to have event
    // listeners here, that we can use for delegation.
    var widget = document.createElement('fieldset');
    element.replaceWith(widget);
    widget.appendChild(element);

    // Also use a seperate container for just the input elements.
    var valuesList = document.createElement('fieldset');
    widget.appendChild(valuesList);

    var newValueButton = document.importNode(buttonTemplate.content, true);
    newValueButton.querySelector('button').addEventListener('click', addValue);
    widget.appendChild(newValueButton);

    function recalculateValue(event) {
        // Set the element (which in reality would be a hidden field) to have a value
        // that is the list of values, but only from widgets that are not disabled.
        element.value = Array.from(valuesList.querySelectorAll('input'))
            .filter((input) => !input.disabled)
            .map((input) => input.value)
            .join(',');
        element.dispatchEvent(new Event('change', {bubbles: true}));
    }

    valuesList.addEventListener('change', recalculateValue);


    // When the remove button is clicked and we are an existing (loaded from server)
    // value, we just want to toggle disabled: this means it's easy for the user to
    // revert that change. Perhaps all deletions should just trigger this?
    // We also trigger a recalculateValue() whenever we have this.
    function toggleValue(event) {
        var $button = $(event.target);
        var input = event.target.parentElement.previousElementSibling;
        input.disabled = !input.disabled;
        if(input.disabled){
           $button.removeClass('la-times danger');
           $button.addClass('la-undo info');
        } else {
            $button.addClass('la-times danger');
            $button.removeClass('la-undo info');
        }
        recalculateValue();
    }

    function removeValue(event) {
        $(event.target).parents('fieldset.form-group').remove();
        recalculateValue();
    }

    function addValue(event) {
        // Add new copy of row template, set the value to value.
        var newRow = document.importNode(rowTemplate.content, true);
        var input = newRow.querySelector('input');
        var button = newRow.querySelector('[data-array-remove-row]');
        valuesList.appendChild(newRow);
        // If we have an event, then add a removeValue listener on
        // the button, else a toggleValue listener.
        if (event instanceof Event) {
            button.addEventListener('click', removeValue);
            input.focus();
        } else {
            input.value = event;
            button.addEventListener('click', toggleValue);
        }
    }

    function init() {
        initialValue.split(',').forEach(addValue);
    }

    function reset() {
        valuesList.innerHTML = '';
        setTimeout(init, 0);
    }

    widget.form.addEventListener('reset', reset);

    // Make the array widget sortable: when the ordering is changed, we
    // need to trigger the value being changed.
    init();
}

$(function(){
   $('input.array-field-widget').each(function(){
       new ArrayWidget(this);
   })
});
