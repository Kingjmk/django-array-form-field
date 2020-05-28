from django.contrib.postgres.forms.array import SimpleArrayField
from django import forms


class ArrayWidget(forms.HiddenInput):
    class Media:
        js = ['js/array-field.js', ]


class ArrayField(SimpleArrayField):
    input_class_name = 'array-field-widget'
    widget = ArrayWidget

    default_error_messages = {
        'item_duplicated': _('Item %(nth)s in the array is a duplicate of item %(dup_nth)s'),
    }

    def clean(self, value):
        value = super().clean(value)
        return self.delimiter.join([self.base_field.clean(val) for val in value])

    def __init__(self, *args, **kwargs):
        super(ArrayField, self).__init__(*args, **kwargs)
        widget_class = self.widget.attrs.get('class', '')
        self.widget.attrs['class'] = f'{widget_class} {self.input_class_name}'

    def validate(self, value):
        super().validate(value)
        errors = []
        for index, item in enumerate(value):
            for child_index, child_item in enumerate(value):
                if index <= child_index:
                    continue
                if item == child_item:
                    errors.append(forms.ValidationError(
                        self.error_messages['item_duplicated'],
                        code='item_duplicated',
                        params={'nth': index + 1, 'dup_nth': child_index + 1}
                    ))
                    break

        if errors:
            raise forms.ValidationError(errors)
