import React from 'react';

import watch from 'util/watch';

import {
	Table
} from 'antd';

{% macro renderArray(node, root) %} <Table
	data={field}
	columns={ {{ getColumns(node.$children, false) }} }/>
{%- endmacro %}

{% macro renderString(node, root) %} {% if root %} field
{% else %} <Input/>
{%- endif %}
{%- endmacro %}


{% macro render(node, root) %} {% if node.$type === 'Array' %} {{ renderArray(node, root) }}
	{%- endif %} {% if node.$type === 'String' %} {{ renderString(node, root) }}	
	{%- endif %}
{%- endmacro %}

{% macro getColumns(schema, root) %} [
	{% for node in schema %}
	{
		'dataIndex': '{{ loop.key }}',
		render(field, data) => {{ render(node, root) }}
	},
	{%- endfor %}
	]
{%- endmacro %}

@watch({{ name }}Store)
export default class {{ name }} extends React.Component {

	{{ name }}Columns = {{ getColumns(schema, true) }};
	
	render() {
	
	}
}
