const getDb=require('../util/database').getDb;
const mongodb=require('mongodb');
class Product{
  constructor(title,price,description,imageUrl,id,userId){
    this.title=title;
    this.price=price;
    this.description=description;
    this.imageUrl=imageUrl;
    this._id= id ?new mongodb.ObjectId(id):null;
    this.userId=userId;  //req.user  (when user login)
  }

  save(){
 const db=getDb();
 let dbOp;
 if(this._id){
dbOp=db.collection('product')
.updateOne({_id:this._id},{$set:this});  //which,updateddata
 }
 else{
 dbOp=db
.collection('product').insertOne(this) 

 }
return dbOp.then(result=>console.log(result))
 .catch(err=>console.log(err));
  }

static fetchAll(){
   const db=getDb();
  return db.collection('product').find().toArray()  //not return promise return cursor
  .then(products=>{
    console.log(products);
    return products;
  })
  .catch(err=>console.log(err));
}


static findById(prodId){
  const db=getDb(); //get acces to database connection
  return db.collection('product').find({_id : new mongodb.ObjectId(prodId)})
  .next() //1 element next point to last 
.then(product=>{
console.log(product);
return product;
})
.catch(e=>console.log(e))
}


static deleteById(prodId){
  const db=getDb();
    return db.collection('product').deleteOne({_id : new mongodb.ObjectId(prodId)})
.then(product=>{
console.log(product,"Delete");
return product;
})
.catch(e=>console.log(e))
}

}
module.exports = Product;

// const Product = sequelize.define('product', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });

// module.exports = Product;
