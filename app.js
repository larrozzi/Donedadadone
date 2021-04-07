
const express = require("express");
const app = express();
const mongoose = require("mongoose")
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://amin-yassine:Basics701@cluster0.jlgx0.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const itemSchema = new mongoose.Schema({
  name: {
    type:  String, 
    required: [true, "please check your data entry, no name specified"]
  }
})

const Item = new mongoose.model("Item", itemSchema)

const item1 = new Item({
  name: "Send Money"
})

const item2 = new Item({
  name: "Get gift cards"
})

const item3 = new Item({
  name: "Go for a walk"
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = new mongoose.model("List", listSchema)

app.get("/:customListName", (req,res)=>{
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({name: customListName}, (err, foundList)=>{
    if(!err){
      if (foundList){
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
      else {
        const list = new List({
          name :customListName,
          items: defaultItems
        })
        list.save()
        res.redirect("/"+customListName)
      }
    }
  })
    
})

app.get("/", function(req, res) {

  Item.find({},(err, foundItems)=>{
    if (foundItems.length===0) {
      Item.insertMany(defaultItems, (err)=>{
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added default items to the database");
        }
      })
       res.redirect("/")     
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }    
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if (listName==="Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete", (req,res)=>{

  const itemToDelete = req.body.delete
  const listName = req.body.listName

  if (listName === "Today"){
    Item.findByIdAndRemove(itemToDelete, (err)=>{
      if (err)
        console.log("Could not delete: ", err);
      else
        console.log("Successfully deleted item with id:", itemToDelete );
      res.redirect("/");
    })
  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:itemToDelete}}},(err,foundList)=>{
      if(!err){
        res.redirect("/" + listName)
      }
    })
  }



})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT

if (port ==null || port=="")
  port = 3000;

app.listen (port, ()=>{
  console.log("Server has started successfully ");
})