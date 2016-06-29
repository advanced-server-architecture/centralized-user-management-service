# Introduction



# API

## Application API

> All request must be signed (see [util/signRequest.js](util/signRequest.js) for detail).


### Sign Up

> POST /signup

--

> Request

```js
{
	method: String,  // username/phone
	account: String, // username/phone number
	secret: String   // password
}
```

> Response

```js
[{
	_id: String
}]
```

### Sign in

> POST /authorize

--

> Request

```js
{
	method: String,  // username/phone
	account: String, // username/phone number
	secret: String   // password
}
```

> Response

```js
[
	{
		token: String,
      	expireAt: Number,
      	scope: {
 			scopeId: String,
 			scopeName: String     
      	},  // only presents when user is owner of an application.
		roles: [{
			_id: String,
			scopeId: String,
			scope: String,
			scopeName: String,
			name: String,
		}],
		permissions: [{
			_id: String,
			scopeId: String,
			scope: String,
			scopeName: String,
			name: String,
		}],
		profiles: [{
			application: String
		}]
    }
  ]
```




