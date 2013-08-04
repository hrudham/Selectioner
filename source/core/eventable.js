define(
	function() 
	{
		var Eventable = window.Eventable = function () { };
			
		Eventable.prototype.on = function (name, handler, context)
		{
			var names = name.split(' ');
			if (names.length > 1)
			{
				// Bind a set of space separated events to a single 
				// event handler recursively.
				names.forEach
					(
						function (item, index, array)
						{
							this.on(item, handler, context);
						},
						this
					);
			}
			else
			{
				// Bind a single event to an event handler.
				if (!this._eventHandlers) this._eventHandlers = {};
				if (!this._eventHandlers[name]) this._eventHandlers[name] = [];

				this._eventHandlers[name].push
					({
						handler: handler,
						context: context ? context : this
					});
			}

			return this;
		};

		Eventable.prototype.off = function (name, handler)
		{
			if (!this._eventHandlers) return this;

			// Function that unbinds any occurances of an event handler from an event.
			var unbindEventHandler = function (eventName, eventHandler)
			{
				for (var i = 0, length = this._eventHandlers[eventName].length; i < length; i++)
				{
					if (this._eventHandlers[eventName][i].handler == eventHandler)
					{
						this._eventHandlers[eventName].splice(i, 1);
					}
				}
			};

			if (!name)
			{
				// Unbind all events from this object.
				delete this._eventHandlers;
			}
			else if (name && !handler)
			{
				if (typeof name != 'function')
				{
					// Name is the name of an event that needs to 
					// have all it's handlers be unbound.
					if (!this._eventHandlers[name]) return this;

					// Setting an Arrays length to zero empties it.
					this._eventHandlers[name].length = 0; 
				}
				else
				{
					// Name is a function, and is therefore the handler 
					// being unbound for events its associated with.
					var eventHandler = name;
					for (var eventName in this._eventHandlers)
					{
						unbindEventHandler.call(this, eventName, eventHandler);
					}
				}
			}
			else
			{
				// Unbind an event handler associated with this event.
				if (!this._eventHandlers[name]) return this;

				unbindEventHandler.call(this, name, handler);
			}

			return this;
		};


		// Triggers an event, passing through data as an optional parameter.
		Eventable.prototype.trigger = function (name, data)
		{
			if (!this._eventHandlers) return;

			var eventHandlers = this._eventHandlers[name];
			if (eventHandlers)
			{
				var target = this;
				for (var i = 0, length = eventHandlers.length; i < length; i++)
				{
					var eventHandler = eventHandlers[i];
					eventHandler.handler.call
						(
							eventHandler.context,
							{
								target: target,
								name: name,
								data: data
							}
						);
				}
			}

			return this;
		};
	}
);