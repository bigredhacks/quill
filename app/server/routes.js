const path = require("path");

const indexLocation = path.resolve(__dirname, "../client/index.html");

module.exports = function (app) {

    app.get("/little", (req, res) => {
        res.redirect("https://littleredhacks.typeform.com/to/VYi7s0");
    })

    // Application ------------------------------------------
    app.get("/", (req, res) => {
        res.sendFile(indexLocation);
    });

    // Wildcard all other GET requests to the angular app
    app.get("*", (req, res) => {
        res.sendFile(indexLocation);
    });
};
