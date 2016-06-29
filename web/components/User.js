module.exports = {
	name: 'User',
	schema: {
		credentials: {
			$type: 'Array',
			$children: {
				method: {
					$type: 'String',
				},
				account: {
					$type: 'String'
				},
				secret: {
					$type: 'String'
				}
			}
		},
		name: {
			$type: 'String'
		}
	}
}
