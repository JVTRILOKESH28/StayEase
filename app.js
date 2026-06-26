require("dotenv").config();

const express=require("express");
const app=express();
const port=process.env.PORT || 3000;
const path=require("path");
const methodOverride=require("method-override");
// ejs-mate
const ejsmate=require("ejs-mate");
app.engine("ejs",ejsmate);
const wrapAsync=require("./utils/wrapasync.js");
const expresserror=require("./utils/expresserror.js");
const Review = require("./models/review.js");
const Listing = require("./models/listing.js");
const { listingSchema, reviewSchema } = require("./schema.js");
app.use(methodOverride('_method'));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,'/views'));

const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const User=require("./models/user.js");
const listing=require("./models/listing.js");
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const sessionConfig={
    secret:process.env.SESSION_SECRET || "thisisasecret",
    resave:false,
    saveUninitialized: false,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
    
};
app.use(session(sessionConfig));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        let errmsg = error.details.map(el => el.message).join(",");
        throw new expresserror(400, errmsg);
    }
    next();
};


const validatereview = (req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);

    if(error){
        const errmsg = error.details.map(el => el.message).join(",");
        throw new expresserror(400, errmsg);
    }

    next();
};
app.listen(port,()=>{
    console.log("server is listening");
})

const mongoose=require("mongoose");
main().catch(err =>{console.log(err)});
async function main(){
    const MONGO_URL =
    process.env.MONGO_URL || "mongodb://mongodb:27017/StayEase";

    await mongoose.connect(MONGO_URL);
}
// index route
app.get("/listings",wrapAsync(async (req,res)=>{
    const allListings = await listing.find({});
    res.render("listings/index",{allListings});
    
}));

// new route
app.get("/listings/new", wrapAsync(async (req,res)=>{
    res.render("listings/new.ejs")
}));
// create route
app.post("/listings",validateListing,wrapAsync(async (req,res)=>{
    
    // if(error){
    //     throw new expresserror(400,error.details[0].message);
    // }
        const newlistings= new listing(req.body.listing);
        req.flash("success","Successfully made a new listing");
        await newlistings.save();
        res.redirect("/listings");
}),
)
// read route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await listing.findByIdAndUpdate(id, req.body.listing);
  res.redirect(`/listings/${id}`);
}));
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const foundlisting = await listing.findById(id).populate("reviews");

    if (!foundlisting) {
        throw new expresserror(404, "Listing not found");
    }

    res.render("listings/show", { foundlisting });
}));

// edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    const {id}=req.params;
    const foundlisting= await listing.findById(id);
    res.render("listings/edit",{foundlisting});
}));
// update route
app.get("/listings",validateListing, wrapAsync(async (req, res) => {
    if(!req.body.listing){
        throw new expresserror(400,"invalid listing data");
    }
  const allListings = await listing.find({});
  res.render("listings/index", { allListings });
}));
// delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));


//review route
app.post(
  "/listings/:id/reviews",
  validatereview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body.review;

    const foundlisting = await Listing.findById(id);

    if (!foundlisting) {
      throw new expresserror(404, "Listing not found");
    }

    const newReview = new Review({ rating, comment });
    await newReview.save();

    foundlisting.reviews.push(newReview);

    await foundlisting.save();

    res.redirect(`/listings/${id}`);
  })
);
//review deletw
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    const {id,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))

//signup route
app.get("/signup",(req,res)=>{
    res.render("users/signup");
})

app.post("/signup",wrapAsync(async (req,res)=>{
    try{
        const {username,email,password}=req.body;
        const newuser= new User({email,username});
        await User.register(newuser,password);
        res.redirect("/listings");
    }
    catch(e){
        // req.flash("error",e.message);
        res.redirect("/signup");
    }
}))

app.all("*",(req,res,next)=>{
    next(new expresserror(404,"page not found"));
})

app.use((err,req,res,next)=>{
    let{statuscode,message}=err;
    // res.status(statuscode).send(message);
    res.render("error.ejs",{err});
})
