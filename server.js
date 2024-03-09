// Importing required modules
import { createServer } from "http";
import { appendFile, readFile } from "fs";
import { parse } from "url";

// Setting up server port
const PORT = 3000;

// Creating server
const server = createServer((req, res) => {
  // Parsing URL
  const { pathname, query } = parse(req.url, true);

  // Handling different routes
  if (pathname === "/") {
    // Homepage route
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Welcome to my nodejs Assignment!");
  } else if (pathname === "/create") {
    // Handling form submission
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <form action="/add" method="post">
          <label for="userName">User Name:</label>
          <input type="text" id="userName" name="userName">
          <button type="submit">Submit</button>
        </form>
      `);
    }
  } else if (pathname === "/add" && req.method === "POST") {
    // Handling submission of the form to add a user
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const { userName } = parseFormData(body);
      appendFile("users.txt", `${userName}\n`, (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          res.writeHead(302, { Location: "/users" });
          res.end();
        }
      });
    });
  } else if (pathname === "/users") {
    // Handling users route
    readFile("users.txt", "utf8", (err, data) => {
      if (err || !data) {
        // When No users found, redirect to create route
        res.writeHead(302, { Location: "/create" });
        res.end();
      } else {
        // When Users found, display them
        const users = data.split("\n").filter((user) => user !== "");
        const usersString = users.join(", ");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Users: ${usersString}</h1>`);
      }
    });
  } else {
    // Handling unknown routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});

// Starting the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Function to parse form data
const parseFormData = (data) => {
  return data.split("&").reduce((acc, pair) => {
    const [key, value] = pair.split("=");
    acc[key] = decodeURIComponent(value.replace(/\+/g, " "));
    return acc;
  }, {});
};
