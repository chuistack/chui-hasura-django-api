exports["default"] = function (event, context) {
    var err;
    var result = {
        status: "You said: " + JSON.stringify(event.headers)
    };
    context
        .status(200)
        .succeed(result);
};
