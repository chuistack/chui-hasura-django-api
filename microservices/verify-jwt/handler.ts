export default (event, context) => {
    let err;
    const result =             {
        status: "You said: " + JSON.stringify(event.headers)
    };

    context
        .status(200)
        .succeed(result);
};