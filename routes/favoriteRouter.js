const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({ user: req.user._id}, (err,favorite)=>{
        if(err){ return next(err);}
        if(!favorite){
            res.statusCode = 403;
            res.end("No favorites found");
        }
    })
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    for(var dish = 0; dish< req.body.dishes.length; dish++)
                    {
                        favorite.dishes.push(req.body.dishes[dish]);
                    }
                    favorite.save()
                    .then((favorite) =>{
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorites) => {
                            console.log('favorite is created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }else{
                if (req.body.length>0){
                for(var dish = 0; dish < req.body.length; dish++)
                {
                    if(favorite.dishes.indexOf(req.body[dish])< 0){
                        favorite.dishes.push(req.body[dish]);
                    }
                }   
            }
                favorite.save()
                .then((favorite) =>{
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        console.log('favorite is created ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                });
            }
        });
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        Favorites.findById(favorite._id)
        .populate('user')
        .populate('dishes')
        .then((favorites) => {
            console.log('favorite is created ', favorites);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})

//////////////////////////////////////////////
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        Favorites.findOne({user: req.user._id}, (err, favorite) =>{
            if(err){ return next(err); }
            if(!favorite){
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite) =>{
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorites) => {
                            console.log('favorite is created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        
                    });
            }, (err) => next(err))
            .catch((err) => next(err));
            }
            else{
                if(favorite.dishes.indexOf(req.params.dishId)< 0){
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite) =>{
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes')
                        .then((favorites) => {
                            console.log('favorite dish added ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                    });
                }
                else{
                    res.statusCode = 200;
                    res.end("Favorite is already added!");
                }
            }
        });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/:dishId`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    
    Favorites.findOne({user: req.user._id}, (err,favorite) =>{
        if(err){
            return next(err);
        }
        if(!favorite){
            res.statusCode = 200;
            res.end("There is no favorite to delete");
        }
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index>-1)
        {
            favorite.dishes.splice(index,1);
            favorite.save()
            .then((resp) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    console.log('favorite is created ', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    });
});

module.exports = favoriteRouter;