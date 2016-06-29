import React from 'react';

import watch from 'util/watch';

import {
    Table
} from 'antd';

{% macro renderArray(node) %} 
<Table
    data={field}
    columns={ {{ getColumns(node.$children, false) }} }/>
{%- endmacro %}

{% macro renderString(node) %} 
<Input/>
{%- endmacro %}


{% macro render(node) %} 
    {% if node.$type === 'Array' %} {{ renderArray(node) }}
    {%- endif %} 
    {% if node.$type === 'String' %} {{ renderString(node) }}    
    {%- endif %}
{%- endmacro %}

{% macro getColumns(schema) %} [
    {% for node in schema %}
    {
        'dataIndex': '{{ loop.key }}',
        render(field, data) => {{ render(node) }}
    },
    {%- endfor %}
    ]
{%- endmacro %}

@watch({{ name }}Store)
export default class {{ name }}Editor extends React.Component {

    
    render() {
        return (<Flex
            >
            {% for node in schema %} {{ render(node) }}
            {%- endfor %}
        </Flex>) 
    }
}
