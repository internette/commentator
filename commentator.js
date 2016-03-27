Events = new Mongo.Collection("events");
Reviews = new Mongo.Collection("reviews");
if (Meteor.isClient) {
  //Helpful Meteor functions
  trimInput = function(value) {
    return value.replace(/^\s*|\s*$/g, '');
};

isNotEmpty = function(value) {
    if (value && value !== ''){
        return true;
    }
    console.log('Please fill in all required fields.');
    return false;
};

isEmail = function(value) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(value)) {
        return true;
    }
    console.log('Please enter a valid email address.');
    return false;
};

isValidPassword = function(password) {
    if (password.length < 6) {
        console.log('Your password should be 6 characters or longer.');
        return false;
    }
    return true;
};

areValidPasswords = function(password, confirm) {
    if (!isValidPassword(password)) {
        return false;
    }
    if (password !== confirm) {
        console.log('Your two passwords are not equivalent.');
        return false;
    }
    return true;
};

//End valid functions
  Template.home.helpers({
    events: function(){
      return Events.find();
    }
  });
  Template.registerHelper('_', function(){
    return _
  });
  Template.reviews.helpers({
    reviews: function(){
      return Reviews.find();
    },
    reviewUrl: function(){
      var noTwenty = window.location.href.split('/')[4].replace(/%20/g, ' ');
      return '/rate-event/' + noTwenty;
    }
  });
  Template.myEvents.helpers({
    events: function(){
      return Meteor.user().events;
    }
  });
  Template.addEvent.events({
    'submit form': function(event){
      event.preventDefault();
      var eventTag = event.target.eventtag.value;
      if (eventTag.indexOf('#')===1){
        var eventTag = event.target.eventtag.value.replace('#','');
      } else {
        var eventTag = event.target.eventtag.value;
      }
      function getCreateDate(){
        var todaysFullDate = new Date();
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var curr_day = days[todaysFullDate.getDay()];
        var curr_month = months[todaysFullDate.getMonth()];
        var curr_date = todaysFullDate.getDate();
        var curr_year = todaysFullDate.getFullYear();
        return curr_day + ", " + curr_month + " " + curr_date + ", " + curr_year;
      }
      Events.insert({
        eventName: event.target.eventname.value.toLowerCase(),
        eventDate: getCreateDate(),
        eventSortDate: new Date(),
        eventVenue: event.target.eventvenue.value,
        eventSpeaker: event.target.eventspeaker.value,
        eventSynopsis: event.target.eventsynopsis.value,
        eventTag: eventTag,
        eventAPINext: '',
        eventAPICall: '',
        eventFlickr: '',
        reviewValues: [],
        attendees: [],
        images: [],
        eventAdmin: Meteor.userId(),
        admin: 'twaffles',
        overallRating: 0
      });
      Router.go('/');
    },
    'click label': function(event){
      $('label').each(function(){
        $(this).children('i').removeClass('fa-star').addClass('fa-star-o');
      });
      $(event.currentTarget).children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).prevAll().children('i').toggleClass('fa-star-o').toggleClass('fa-star');
    }
  });
  Template.logout.events({
    'submit form': function(e,t){
      e.preventDefault();
      Meteor.logout(function(err){
        if (err){
          alert("Unable to logout");
        }
        else{
        }
      });
      Router.go('/');
    }
    });
  Template.eventSimplyTemplate.events({
    'click .didattend': function(e){
      if($(e.currentTarget).text() !=''){
        if($(e.currentTarget).children('span.text').text()==="ATTENDED"){
          Meteor.call("addEvent", this._id, this.eventName, this.eventDate, this.eventSynopsis, this.eventVenue, function(error, user){console.log(user.events)});
          Meteor.call("addUsername", this._id, Meteor.user().username, function(error, user){console.log(user)});        
        } else if ($(e.currentTarget).children('span.text').text()==="NOT ATTENDED"){
          Meteor.call("removeEvent", this._id, this.eventName, this.eventDate, this.eventSynopsis, this.eventVenue, function(error, user){console.log(user.events)});
          Meteor.call("removeUsername", this._id, Meteor.user().username, function(error, user){console.log(user)}); 
        } else {
        }
      }
    }
  });
  Template.eventSimplyTemplate.helpers({
    attended: function(){
      function isInArray(thisid, value) {
        return Events.findOne(thisid).attendees.indexOf(value) > -1;
      }
      if(isInArray(this._id,Meteor.user().username)){
        return "NOT ATTENDED";
      } else {
        return "ATTENDED";
      }
    },
    attendedicon: function(){
      function isInArray(thisid, value) {
        return Events.findOne(thisid).attendees.indexOf(value) > -1;
      }
      if(isInArray(this._id,Meteor.user().username)){
        return "close";
      } else {
        return "check";
      }
    },
    attendedlabel: function(){
      function isInArray(thisid, value) {
        return Events.findOne(thisid).attendees.indexOf(value) > -1;
      }
      if(isInArray(this._id,Meteor.user().username)){
        return 'Attended';
      } else {
      }
    }
  });
  Template.ratingSheet.events({
   'click #event-name-ratings>label': function(event){
      $('#event-name-ratings label').each(function(){
        $(this).children('i').removeClass('fa-star').addClass('fa-star-o');
      });
      $(event.currentTarget).prev().prop('checked', true);
      if($(event.currentTarget).prev().prop('checked', true)){
        //console.log($(event.currentTarget).prev().prop('value'));
      }
      $(event.currentTarget).children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).prevAll().children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).addClass('final-name');
    },
    'click #event-speaker-ratings>label': function(event){
      $('#event-speaker-ratings label').each(function(){
        $(this).children('i').removeClass('fa-star').addClass('fa-star-o');
      });
      $(event.currentTarget).prev().prop('checked', true);
      if($(event.currentTarget).prev().prop('checked', true)){
        //console.log($(event.currentTarget).prev().prop('value'));
      }
      $(event.currentTarget).children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).prevAll().children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).addClass('final-speaker');
    },
    'click #event-experience-ratings>label': function(event){
      $('#event-experience-ratings label').each(function(){
        $(this).children('i').removeClass('fa-star').addClass('fa-star-o');
      });
      $(event.currentTarget).prev().prop('checked', true);
      if($(event.currentTarget).prev().prop('checked', true)){
        //console.log($(event.currentTarget).prev().prop('value'));
      }
      $(event.currentTarget).children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).prevAll().children('i').toggleClass('fa-star-o').toggleClass('fa-star');
      $(event.currentTarget).addClass('final-experience');
    },
    'submit form#ratings': function(event){
      event.preventDefault();
      var reviewHeader = event.target.reviewHeader.value;
      var venueRating = $('.star.final-name').prev().val();
      var speakerRating = $('.star.final-speaker').prev().val();
      var overallRating = $('.star.final-experience').prev().val();
      var average = (Number(venueRating)+Number(speakerRating)+Number(overallRating))/3;
      var addtComments = event.target.additionalComments.value;
      var startPt = 1;
      Events.upsert({_id: this._id},{$push: {reviewValues: average}});
      

      if (this.reviewValues.length>=1){
        var avg = startPt;
      } else {
        var avg = startPt/(this.reviewValues.length);
      }
      Reviews.insert({
        eventName: $('h2').text().toLowerCase(),
        eventVenueRating: event.target.venue.value,
        eventSpeakerRating: event.target.speaker.value,
        eventExperienceRating: event.target.overall.value,
        additionalComments: addtComments,
        averageRating: average,
        owner: Meteor.userId(),
        username: Meteor.user().username,
        reviewHeader: reviewHeader,
        eventId: this._id
      });
      Events.upsert({_id: this._id},{$set: {overallRating: avg}});
      Router.go('/');
    }
  });
Template.login.events({
  'submit form': function(e){
      e.preventDefault();
      var unam = e.target.username.value;
      var password = e.target.password.value;
      Meteor.loginWithPassword(unam,password,function(err){
        if(err){
          alert('Wrong Credentials');
        } else {
          Router.go('/');
        }
      });
      Router.go('/');
  }
  });
  Template.signup.events({
  'mousedown a': function(event){
    $(event.currentTarget).prev().prop('type','text')
  },
  'mouseup a': function(event){
    $(event.currentTarget).prev().prop('type','password')
  },
  'submit form': function(event){
    event.preventDefault();
     var username = event.target.username.value;
     var password = event.target.password.value;
     var passwordagain = event.target.passwordagain.value;
     var email = event.target.email.value;
     if(password != passwordagain){
      alert('passwords do not match')
     } else {
      Accounts.createUser({
        username: username,
        password: password,
        email: email,
        events: [],
        profileImg: ''
      }, function(err){
        if(err){
          console.log('You are not logged in');
        
      } else {
        Router.go('/');
      }
      });
     }
     return false;
  }
});
  //Reset Password Templates
  Template.ForgotPassword.events({
  'submit #forgotPasswordForm': function(e, t) {
    e.preventDefault();
 
    var forgotPasswordForm = $(e.currentTarget),
        email = trimInput(forgotPasswordForm.find('#forgotPasswordEmail').val().toLowerCase());
 
    if (isNotEmpty(email) && isEmail(email)) {
 
      Accounts.forgotPassword({email: email}, function(err) {
        if (err) {
          if (err.message === 'User not found [403]') {
            console.log('This email does not exist.');
          } else {
            console.log('We are sorry but something went wrong.');
          }
        } else {
          Router.go('/success-email')
        }
      });
 
    }
    return false;
  }
});
 
if (Accounts._resetPasswordToken) {
  Session.set('resetPassword', Accounts._resetPasswordToken);
}
 
Template.ResetPassword.helpers({
 resetPassword: function(){
  return Session.get('resetPassword');
 }
});
 
Template.ResetPassword.events({
  'submit #resetPasswordForm': function(e, t) {
    e.preventDefault();
    
    var resetPasswordForm = $(e.currentTarget),
        password = resetPasswordForm.find('#resetPasswordPassword').val(),
        passwordConfirm = resetPasswordForm.find('#resetPasswordPasswordConfirm').val();
 
    if (isNotEmpty(password) && areValidPasswords(password, passwordConfirm)) {
      Accounts.resetPassword(Session.get('resetPassword'), password, function(err) {
        if (err) {
          console.log('We are sorry but something went wrong.');
        } else {
          console.log('Your password has been changed. Welcome back!');
          Session.set('resetPassword', null);
        }
      });
    }
    return false;
  }
});
Template.userdetails.helpers({
  profileimg: function(){
    return Meteor.user().profileImg;
  }
});
Template.username.helpers({
  profileimg: function(){
    return Meteor.user().profileImg;
  }
});
//End Password Recovery
  Template.imageGrid.helpers({
    events: function(){
      return Events.find();
    }
  });
  Template.imageGrid.events({
    'click #next': function(){
      console.log(this);
      Meteor.call("instagramFetchMore", this.eventTag, this._id, function(err, res){if(err){} else {console.log(res)}});
    }
  });
  Template.editEvent.helpers({
    thisevent: function(){
      return Events.find();
    }
  });
  Template.editEvent.events({
    'focus input': function(e){
      $(e.currentTarget).parent('.form-input').css({'border':'1px solid #cbe86b'});
    },
    'blur input': function(e){
      $(e.currentTarget).parent('.form-input').css({'border':'1px solid #eeeeee'});
    },
    'click #cancel': function(){
      Router.go('/');
    },
    'submit form': function(e){
      e.preventDefault();
      var eventName = e.target.eventName.value;
      var eventVenue = e.target.eventVenue.value;
      var eventSpeaker = e.target.eventSpeaker.value;
      var eventTag = e.target.eventTag.value;
      if(eventName==='' || eventVenue==='' || eventSpeaker==='' || eventTag===''){
        $('#alertError').show();
      } else {
        Meteor.call('updateEvent', this._id, eventName, eventVenue, eventTag, eventSpeaker, function(err,res){if(err){console.log(err)}})
      }
      }
  });
  Template.reviewTemplate.rendered = function(){
    $('p.rating').each(function(){
      if($(this).text()<=(0.5)){
        'true'  
      } else if($(this).text()<=(1) && $(this).text()>(0.5)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
      } else if($(this).text()<=(1.5) && $(this).text()>(1)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
      }  else if($(this).text()<=(2) && $(this).text()>(1.5)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
      }  else if($(this).text()<=(2.5) && $(this).text()>(2)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
      }  else if($(this).text()<=(3) && $(this).text()>(2.5)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
      }  else if($(this).text()<=(3.5) && $(this).text()>(3)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i>');
      }  else if($(this).text()<=(4) && $(this).text()>(3.5)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i>');
      } else if($(this).text()<=(4.5) && $(this).text()>(4)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i>');
      } else if($(this).text()>(4.5)){
        $(this).html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>');
      }
    });
  }
  /*Template.imageGrid.helpers({
  });*/
  Template.eventDetails.rendered = function() {
   function replaceWithStars(){
    if($('p.rating').text()<=(1/2)){
      $('p.rating').html('<i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    } else if($('p.rating').text()<=(1) && $('p.rating').text()>(1/2)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    } else if($('p.rating').text()<=(1.5) && $('p.rating').text()>(1)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    }  else if($('p.rating').text()<=(2) && $('p.rating').text()>(1.5)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    }  else if($('p.rating').text()<=(2.5) && $('p.rating').text()>(2)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    }  else if($('p.rating').text()<=(3) && $('p.rating').text()>(2.5)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i>');
    }  else if($('p.rating').text()<=(3.5) && $('p.rating').text()>(3)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i><i class="fa fa-star-o"></i>');
    }  else if($('p.rating').text()<=(4) && $('p.rating').text()>(3.5)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-o"></i>');
    } else if($('p.rating').text()<=(4.5) && $('p.rating').text()>(4)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star-half-o"></i>');
    } else if($('p.rating').text()>(4.5)){
      $('p.rating').html('<i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i>');
    }
   }
   replaceWithStars();
  }
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
      process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
      Events.allow({
        insert: function(userId, event){
          return true;
        }
      });
  });
  Meteor.methods({
    save_url:function(response){
      //console.log(response.upload_data.url);
      //Meteor.users.update(Meteor.userId(), {$set: {profileImg: response.upload_data.url}});
      //return Meteor.user();
      //Session.set('profileimg', )
      console.log(response.upload_data.public_id);
    },
    addEvent: function(id, title, date, synopsis, location){
      Meteor.users.update(Meteor.userId(), {$push: {events: {_id: id, eventName: title, eventDate: date, eventSynopsis: synopsis, eventVenue: location}}});
      return Meteor.user();
    },
    removeEvent: function(id, title, date, synopsis, location){
      Meteor.users.update(Meteor.userId(), {$pull: {events: {_id: id, eventName: title, eventDate: date, eventSynopsis: synopsis, eventVenue: location}}});
      return Meteor.user();
    },
    updateEvent: function(id, name, venue, tag, speaker){
      Events.update({_id: id}, {$set: {eventName: name, eventVenue: venue, eventTag: tag, eventSpeaker: speaker}})
    },
    addUsername: function(id,user){
      Events.update({_id: id},{$push: {attendees: user}});
    },
    removeUsername: function(id,user){
      Events.update({_id: id},{$pull: {attendees: user}});
    },
    instagramFetch: function (tag,thisid) {
      this.unblock();
      var tagurl="https://api.instagram.com/v1/tags/"+tag+"/media/recent?client_id=eaf335004d444c0bb79e67bb6f82ad1c";
      try {
        var apicall = HTTP.get(tagurl, function(error, images){
          var imageData = images.data.data;
          var eventImgs = [];
          _.each(imageData, function(image){
            var imgctx = {};
            imgctx.link = image.link;
            imgctx.standard = image.images["standard_resolution"].url;
            imgctx.thumb = image.images.thumbnail.url;
            eventImgs.push(imgctx);
          }, this);
          _.each(eventImgs, function(img){
            if(Events.findOne({_id:thisid}).images.length<=0){
              Events.update(thisid, {$push: {images: img}});
            } else if(Events.find({_id:thisid, 'images.link':img.link, 'images.standard':img.standard, 'images.thumb':img.thumb}).fetch().length<=0){
              Events.update(thisid, {$push: {images: img}});
            } else {

            }
          }, this);
          Events.update(thisid, {$set: {eventAPINext: images.data.pagination.next_max_id}});
        });
        return apicall;
      } catch (e) {
        console.log(e);
      }
    },
    instagramFetchMore: function (tag,thisid) {
      this.unblock();
      var tagurl="https://api.instagram.com/v1/tags/"+tag+"/media/recent?client_id=eaf335004d444c0bb79e67bb6f82ad1c&max_tag_id=" + Events.find().eventAPINext;
      try {
        var apicall = HTTP.get(tagurl, function(error, images){
          var imageData = images.data.data;
          var eventImgs = [];
          _.each(imageData, function(image){
            var imgctx = {};
            imgctx.link = image.link;
            imgctx.standard = image.images["standard_resolution"].url;
            imgctx.thumb = image.images.thumbnail.url;
            eventImgs.push(imgctx);
          }, this);
          _.each(eventImgs, function(img){
            if(Events.findOne({_id:thisid}).images.length<=0){
              Events.update(thisid, {$push: {images: img}});
            } else if(Events.find({_id:thisid, 'images.link':img.link, 'images.standard':img.standard, 'images.thumb':img.thumb}).fetch().length<=0){
              Events.update(thisid, {$push: {images: img}});
            } else {

            }
          }, this);
          Events.update(thisid, {$set: {eventAPINext: images.data.pagination.next_url}});
        });
        return apicall;
      } catch (e) {
        console.log(e);
      }
    }
  });
  Meteor.publish('allevents', function(){
    return Events.find({});
  });
  Meteor.publish('eventname', function(eventname){
    return Events.find({eventName: eventname});
  });
  Meteor.publish('eventid', function(eventid){
    return Events.find({_id: eventid});
  });
  Meteor.publish('event-reviews', function(eventid){
    return Reviews.find({eventId: eventid});
  });
  Meteor.publish('userByUsername', function(username){
    return Meteor.users.find({username:username}, {fields: {profileImg: 1, events:true}});
  });
  Meteor.publish('userById', function(userid){
    return Meteor.users.find({_id: userid}, {fields: {profileImg: 1}});
  });
  Accounts.onCreateUser(function(options,user){
    user.events = [];
    user.profileImg = '';
    return user;
  });
  }
  Router.route('/', {
    name: "home",
    waitOn: function(){
      Meteor.subscribe('allevents');
    },
    data: function(){
      return Events.find();
    },
    action: function(){
      if(this.ready()){
        this.render('home')}
    }
});
Router.route('/add-event',{
  name: "addEvent",
  data: function(){
    return Events.find();
  },
  action: function(){
    if(this.ready()){
      this.render('addEvent')
    }
  }
});
Router.route('/rate-event/:_id', {
  name: "ratethis",
  waitOn: function(){
    return Meteor.subscribe('eventid', this.params._id);
  },
  data: function(){
    return Events.findOne({_id: this.params._id});
  },
  action: function(){
    if(this.ready()){
      this.render("ratingSheet");
    } else {
      console.log("error");
    }
  }
});
Router.route('/events/:_id', {
  name: "eventName",
  waitOn: function(){
    return Meteor.subscribe('eventid', this.params._id);
  },
  data: function(){
    return Events.findOne({_id: this.params._id});
  },
  action: function(){
    if(this.ready()){
      this.render("eventDetails");
    } else {
      console.log('error');
    }
  }
});
Router.route('/events/:_id/images', {
  name: "eventImages",
  waitOn: function(){
    return Meteor.subscribe('eventid', this.params._id);
  },
  data: function(){
    return Events.findOne({_id: this.params._id});
  },
  action: function(){
    if(this.ready()){
      Meteor.call("instagramFetch", this.params.eventTag, this.params._id, function(err, res){if(err){} else {console.log(res)}});
      this.render('imageGrid');
    } else {
      console.log('error')
    }
  }
});
Router.route('/forgot', {
  name: 'forgot',
  action: function(){
    if(this.ready()){
      this.render('ForgotPassword');
    } else {
      console.log('error')
    }
  }
});
Router.route('/reset-password', {
  name: 'reset-password',
  action: function(){
    if(this.ready()){
      this.render('ResetPassword');
    } else {
      console.log('error')
    }
  }
});
Router.route('/success-email', {
  name: 'success-email',
  action: function(){
    if(this.ready()){
      this.render('successEmail');
    } else {
      console.log('error')
    }
  }
});
Router.route('/events/:_id/event-reviews', {
  name: "eventReviews",
  waitOn: function(){   
    return Meteor.subscribe('event-reviews', this.params._id);
  },
  data: function(){
    return Reviews.find();
  },
  action: function(){
    if(this.ready()){
      this.render("reviews");
    } else {
      console.log('error');
    }
  }
});
Router.route('/:_id/edit-event', {
  name: "editEvent",
  waitOn: function(){   
    return Meteor.subscribe('eventid', this.params._id);
  },
  data: function(){
    return Events.findOne({_id: this.params._id});
  },
  action: function(){
    if(this.ready()){
      this.render("editEvent");
    } else {
      console.log('error');
    }
  }
});
Router.route('/login');
Router.route('/signup');
Router.route('/logout');
Router.route('/user/:_id', function(){
  this.wait(Meteor.subscribe('userById', this.params._id));
  if (this.ready()){
    this.render('username', {
      data: function(){
        return Meteor.users.findOne({_id: this.params._id});
      }
    });
  }
});
Router.route('/userdetails', function(){
  this.wait(Meteor.subscribe('userById', Meteor.user()._id));
  if (this.ready()){
    this.render('userdetails', {
      data: function(){
        return Meteor.users.findOne({_id: Meteor.user()._id});
      }
    });
  }
});
Router.route('/editaccount', function(){
  this.wait(Meteor.subscribe('userById', this.params._id));
  if (this.ready()){
    this.render('editAccount', {
      data: function(){
        return Meteor.users.findOne({_id: this.params._id});
      }
    });
  }
})
Router.route('/:username/events', function(){
  this.wait(Meteor.subscribe('userByUsername',this.params.username));
  if (this.ready()){
    this.render('myEvents', {
      data: function(){
        return Meteor.users.findOne({username: this.params.username});
      }
    });
  }
});
// Additional Codes
