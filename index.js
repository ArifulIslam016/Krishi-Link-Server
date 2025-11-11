const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3000;
const dotenv = require("dotenv").config();
// const username=encodeURIComponent(process.env.DB_USER)
// const password=encodeURIComponent(process.env.DB_PASS)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
console.log(process.env.DB_USER);
const app = express();
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@aiclusters1.5l6vxb7.mongodb.net/?appName=AIClusters1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server initialized");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const KrishiDB = client.db("KrishiDB");
    const CropsCollections=KrishiDB.collection("CropsCollections")
    const KrishiBDtestcoll = KrishiDB.collection("test");
    const newsCollections=KrishiDB.collection("news")   
    app.post("/test", async (req, res) => {
      const newcoll = req.body;
      const result = await KrishiBDtestcoll.insertOne(newcoll);
      res.send(result);
    });


// Get Section

app.get('/news',async(req,res)=>{
    const cursor=newsCollections.find()
    const result=await cursor.toArray()
    res.send(result)
})
app.get('/allcrops',async(req,res)=>{
  const ownerEmail=req.query.email
 const  quary={}
 if(ownerEmail){
  quary['owner.ownerEmail']=ownerEmail
 }

  const cursor=CropsCollections.find(quary)
  const result=await cursor.toArray()
  res.send(result)
})
app.get('/lastest-Crops',async(req,res)=>{
  const cursor=CropsCollections.find().sort({createdAt:-1})
  const result=await cursor.toArray()
  res.send(result)
})
// Post sections
app.post('/CreateCrops',async(req,res)=>{
  const newCrop=req.body
  newCrop.createdAt=new Date()
  const result=await CropsCollections.insertOne(newCrop)
  res.send(result)
})
// interest post section
app.post('/CreateInterest/:cropID',async(req,res)=>{
  const cropId=req.params.cropID
  const userEmail=req.body.userEmail
  console.log(userEmail)
  const Crop=await CropsCollections.findOne({_id:new ObjectId(cropId)})
  if(Crop?.owner?.ownerEmail==userEmail){
    return res.status(403).send({message:"You can't show interest for it"})
  }
  const alreadyinterested=Crop?.interests?.find(singleInterest=>singleInterest.userEmail===userEmail)
  if(alreadyinterested){
  return  res.status(400).send({messgae:"You have already showed your opinion"})
  }
  const interestId=new ObjectId()
const newInterest=req.body
  newInterest._id=interestId
  newInterest.CropId=cropId
  const result= await CropsCollections.updateOne({_id:new ObjectId(cropId)},{$push:{interests:newInterest}})
  res.send(result)
})
// update post section
app.patch('/updatePost/:id',async(req,res)=>{
  const cropId=req.params.id
  const updatedCrop=req.body
  // const selectedCrop=await CropsCollections.findOne({_id:new ObjectId(cropId)})
  const result=await CropsCollections.updateOne({_id:new ObjectId(cropId)},{$set:updatedCrop})
  res.send(result)

})
// Delete a post section
app.delete('/deletePost/:id',async(req,res)=>{
  const id=req.params.id
  const result= await CropsCollections.deleteOne({_id:new ObjectId(id)})
  res.send(result)
})
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run()
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
