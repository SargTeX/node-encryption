var bcrypt = require('bcrypt');

var config = {
	SALT_WORK_FACTOR: 10
};

module.exports.config = function(name, value) {
	if (typeof value === 'undefined') return config[name];

	config[name] = value;
}

module.exports.oneWay = function(schema, fieldName, options) {
	if (!options) options = {};
	if (!options.hasOwnProperty('compareMethod')) options.compareMethod = false;
	if (!options.hasOwnProperty('compareMethodName')) options.compareMethodName = 'compare'+fieldName.charAt(0).toUpperCase()+fieldName.substring(1);

	schema.pre('save', function(callback) {
		var object = this;

		// verschlüssele das Passwort nur, wenn es geändert wurde
		if (!object.isModified(fieldName)) return callback();

		// generiere SALT
		bcrypt.genSalt(config.SALT_WORK_FACTOR, function (err, salt) {
			if (err) return callback(err);

			// verschlüssele das Passwort
			bcrypt.hash(object[fieldName], salt, function(err, hash) {
				if (err) return callback(err);

				// überschreibe Passwort mit Verschlüsselung
				object[fieldName] = hash;
				callback();
			});
		});
	});
	if (options.compareMethod) schema.methods[options.compareMethodName] = function(candidate, callback) {
		bcrypt.compare(candidate, this[fieldName], function(err, isMatch) {
			if (err) return callback(err);
			callback(null, isMatch);
		});
	};
}