import fs from "node:fs";
import express from "express";
import { PrismaClient } from "@prisma/client";
import escapeHTML from "escape-html";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
const prisma = new PrismaClient();

let todos = await prisma.todo.findMany();

function replacer(match, p1, p2, p3, offset, string, groups) {
  const replacement = todos.map(
        (todo) => {
            if(todo.date === 10*Number(p2)+Number(p3)){
              return `
              <li>
                <span>${escapeHTML(todo.title)}</span>
                <form method="post" action="/delete" class="delete-form">
                  <input type="hidden" name="id" value="${todo.id}" />
                  <button type="submit">削除</button>
                </form>
              </li>
            `
            }else{
              console.log(p2);
            }
          },
      )
      .join("");
  return replacement;
}

const template = fs.readFileSync("./todolist.html", "utf-8");
app.get("/", async (request, response) => {
  todos = await prisma.todo.findMany();
  const html = template.replace(
    /(<!--todo)(\d)(\d)(-->)/g,replacer
  );
  response.send(html);
});

app.post("/create", async (request, response) => {
  await prisma.todo.create({
    data: { title: request.body.title,date :Number(request.body.date)},
  });
  response.redirect("/");
});

app.post("/delete", async (request, response) => {
  await prisma.todo.delete({
    where: { id: parseInt(request.body.id) },
  });
  response.redirect("/");
});

app.listen(3000);
