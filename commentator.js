Events = new Mongo.Collection("events");
Events.initEasySearch('eventName');
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
      if(! Meteor.userId()){
        throw new Meteor.Error("not-authorized");
      }
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
  Template.eventDetails.events({
    'click #attended': function(e){
      if($(e.currentTarget).text() !=''){
        if($(e.currentTarget).children('span.text').text()==="Mark Attended"){
          Meteor.call("addEvent", this._id, this.eventName, this.eventDate, this.eventSynopsis, this.eventVenue, function(error, user){console.log(user.events)});
          Meteor.call("addUsername", this._id, Meteor.user().username, function(error, user){console.log(user)});        
        } else if ($(e.currentTarget).children('span.text').text()==="Mark Not Attended"){
          Meteor.call("removeEvent", this._id, this.eventName, this.eventDate, this.eventSynopsis, this.eventVenue, function(error, user){console.log(user.events)});
          Meteor.call("removeUsername", this._id, Meteor.user().username, function(error, user){console.log(user)}); 
        } else {
        }
      }
    }
  });
  Template.eventDetails.helpers({
    attended: function(){
      function isInArray(thisid, value) {
        return Events.findOne(thisid).attendees.indexOf(value) > -1;
      }
      if(isInArray(this._id, Meteor.user().username)){
        return "Mark Not Attended";
      } else {
        return "Mark Attended";
      }
    },
    attendedicon: function(){
      function isInArray(thisid, value) {
        return Events.findOne(thisid).attendees.indexOf(value) > -1;
      }
      if(isInArray(this._id, Meteor.user().username)){
        return "user-times";
      } else {
        return "user-plus";
      }
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
        return "user-times";
      } else {
        return "user-plus";
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
      Router.go('eventReviews');
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
     } else if (Meteor.users.find({username: username}).fetch().length>=1){
      alert('This username already exists');
     } else if (Meteor.users.find({email: email}).fetch().length>=1){
      alert('This e-mail is already being used');
     } else {
      Accounts.createUser({
        username: username,
        password: password,
        email: email,
        events: [],
        profileImg: ''
      }, function(err){
        if(err){
          console.log(err);
        
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
  Template.searchPg.events({
    'click #searchbtn':function(event, instance){
      event.preventDefault();
      $(event.currentTarget).submit();
    }
  });
  Template.editEvent.helpers({
    thisevent: function(){
      return Events.find();
    }
  });
  Template.editEvent.events({
    'focus input': function(e){
      $(e.currentTarget).parent('.form-input').css({'border':'1px solid #9fcd50'});
    },
    'blur input': function(e){
      $(e.currentTarget).parent('.form-input').css({'border':'1px solid #eeeeee'});
    },
    'click #cancel': function(){
      Router.go('/');
    },
    'click #hidemodal': function(e){
      $('#alertError').hide();
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
  Template.editaccount.events({
    'submit form': function(e){
      e.preventDefault();
      if(e.target.newpassword.value != e.target.newpassword2.value){
        document.getElementById('iferror').innerHTML='You new passwords do not match';
        return false;
      } else if ((e.target.newpassword.value === e.target.newpassword2.value)&&(e.target.newpassword.value!=='')&&(e.target.newpassword2.value!=='')){
        Meteor.call("changepassword", e.target.newpassword.value, function(err, res){
          if(err){
            console.log(err)
          } else {
            //Meteor.call("loginnow", Session.get("username"), e.target.newpassword.value);
            Router.go('/');
          }
        });

      }
      var profileimg = '';
      if(Session.get("tempimg") !== '/images/blankprofile-2.png'){
        profileimg = Session.get("tempimg");
      } else if (Session.get("tempimg") === '/images/blankprofile-2.png'){
        profileimg = '';
      }
      Meteor.call("updateProfileImg", profileimg, function(err,res){ if(err){console.log(err)}});
      Router.go('/userdetails');
    },
    'click #removeimg': function(){
      Meteor.call("cloudinary_delete", Session.get('profileimgid'), function(e,r){
        if(!e){
          Session.set("tempimg", '/images/blankprofile-2.png');
          Session.set("filename", '');
        }
      })
    },
    'change #usericonupload': function(ev){
      Meteor.call("cloudinary_delete", Session.get('profileimgid'), function(e,r){
        if(!e){
          Session.set("tempimg", '/images/blankprofile-2.png');
          Session.set("filename", '');
        }
      });
    }
  });
  Template.editaccount.rendered = function(){
    Session.set("tempimg", '/images/blankprofile-2.png');
    Session.set("filename", '');
  }
  Template.myoneevent.events({
    'click .removeevent' : function(){
      Meteor.call('removeUsername', this._id, Meteor.user().username);
      Meteor.call('removeEvent', this._id, this.eventName, this.eventDate, this.eventSynopsis, this.eventVenue);
    }
  });
  Template.editaccount.helpers({
    tempimg: function(){
      return Session.get("tempimg");
    },
    filename: function(){
      return Session.get("filename");
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
  //Cloudinary AddOn
  _cloudinary.after.update(function(user,file){
    if(file.percent_uploaded === 100 && !file.uploading){
      Session.set('profileimgid', file.public_id);
      Session.set('tempimg', file.url);
      Session.set('filename', file.url);
    }
  });
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
  //Transitions
  
  //End Transitions
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
      Reviews.allow({
        insert: function(userId, review){
          return true;
        }
      });
  });
  Meteor.methods({
    tempImg:function(response){
    },
    updateProfileImg: function(profileimg){
      Meteor.users.update(Meteor.userId(), {$set: {profileImg: profileimg}});
      return Meteor.user();
    },
    changepassword:function(password){
      Accounts.setPassword(Meteor.userId(), password, function(err, res) {
        if (err) {
          console.log('We are sorry but something went wrong.');
        } else {
        }
      });
    },
    loginnow: function(user, password){
      Meteor.loginWithPassword(user, password);
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
    return Events.find({}, {attendees: 1});
  });
  Meteor.publish('eventname', function(eventname){
    return Events.find({eventName: eventname}, {attendees: 1});
  });
  Meteor.publish('eventid', function(eventid){
    return Events.find({_id: eventid}, {attendees: 1});
  });
  Meteor.publish('event-reviews', function(eventid){
    return Reviews.find({eventId: eventid});
  });
  Meteor.publish('userByUsername', function(username){
    return Meteor.users.find({username:username}, {fields: {'profileImg': 1, 'events':1}});
  });
  Meteor.publish('userById', function(userid){
    return Meteor.users.find({_id: userid}, {fields: {'profileImg': 1}});
  });
  Meteor.publish('usernamesandemails', function(){
    return Meteor.users.find({},{fields: {'username': 1, 'email': 1}});
  });
    Meteor.publish('editUser', function(){
    if(this.userId){
      return Meteor.users.find({_id: this.userId}, {fields: {'profileImg': 1, 'password': 1}});
    }
  });
  Accounts.onCreateUser(function(options,user){
    user.events = [];
    user.profileImg = '';
    user.password = '';
    return user;
  });
  }
  Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'notfound',
    template: 'home'
  });
  Router.route('/', function(){
    this.wait(Meteor.subscribe('allevents'));
    if(this.ready()){
        if(!Meteor.userId()){
          this.layout('landinglayout');
          this.render('landing');
        } else {
          this.render('home',{
            data: function(){
              return Events.find();
            }
          });
        }
      }
  },{
    name: "home"
  });
Router.route('/add-event',function(){
  if(this.ready()){
    this.render('addEvent',{
      data: function(){
        return Events.find()
      }
    });
  }
},{
  name: "addEvent"
});
Router.route('/search', function(){
    this.wait(Meteor.subscribe('allevents'));
    if(this.ready()){
        this.render('searchPg',{
          data: function(){
            return Events.find();
          }
        })
      }
}, {
  name: "search"
});
Router.route('/rate-event/:_id', function(){
  this.wait(Meteor.subscribe('eventid', this.params._id));
  if(this.ready()){
      this.render('ratingSheet',{
        data: function(){
          return Events.findOne({_id: this.params._id});
        }
      })
    }
}, {
  name: "ratethis"
});
Router.route('/events/:_id', function(){
  this.wait(Meteor.subscribe('eventid', this.params._id));
  if(this.ready()){
    this.render("eventDetails", {
      data: function(){
        return Events.findOne({_id: this.params._id});
      }
    })
  }
},{
  name: "eventName"
});
Router.route('/events/:_id/images', function(){
  this.wait(Meteor.subscribe('eventid', this.params._id));
  if(this.ready()){
    Meteor.call("instagramFetch", this.params.eventTag, this.params._id, function(err, res){if(err){} else {console.log(res)}});
    this.render('imageGrid', {
      data: function(){
        return Events.findOne({_id: this.params._id});
      }
    });
  }
},{
  name: "eventImages"
});
Router.route('/forgot', function(){
  if(this.ready()){
    this.layout('landinglayout');
    this.render('ForgotPassword')
  }
},{
  name: 'forgot'
});
Router.route('/reset-password', function(){
  if(this.ready()){
    this.layout('landinglayout');
    this.render('ResetPassword')
  }
},{
  name: 'reset-password'
});
Router.route('/success-email', function(){
  if(this.ready()){
    this.layout('landinglayout');
    this.render('successEmail');
  }
},{
  name: 'success-email'
});
Router.route('/events/:_id/event-reviews', function(){
  this.wait(Meteor.subscribe('event-reviews', this.params._id));
  this.wait(Meteor.subscribe('allevents'));
  if(this.ready()){
    this.render("reviews", {
      data: function(){
        return {reviews: Reviews.find(),
                  events: Events.find()};
      }
    })
  }
},{
  name: "eventReviews"
});
Router.route('/:_id/edit-event', function(){
  this.wait(Meteor.subscribe('eventid', this.params._id));
  if(this.ready()){
    this.render("editEvent", {
      data: function(){
        return Events.findOne({_id: this.params._id});
      }
    })
  }
},{
  name: "editEvent"
});
Router.route('/login', function(){
  if(this.ready()){
    this.layout('landinglayout');
    this.render('login');
  }
}, {
  name: 'login'
});
Router.route('/signup', function(){
  this.wait(Meteor.subscribe('usernamesandemails'));
  if(this.ready()){
    this.layout('landinglayout');
    this.render('signup');
  }
},{
  name: 'signup'
});
Router.route('/logout', function(){
  if(this.ready()){
    this.render('logout');
  }
},{
  name: 'logout'
});
Router.route('/user/:_id', function(){
  this.wait(Meteor.subscribe('userById', this.params._id));
  if (this.ready()){
    this.render('username', {
      data: function(){
        return Meteor.users.findOne({_id: this.params._id});
      }
    });
  }
},{
  name: 'username'
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
},{
  name: 'userdetails'
});
Router.route('/editaccount', function(){
  this.wait(Meteor.subscribe('editUser'));
  if (this.ready()){
    this.render('editaccount', {
      data: function(){
        return Meteor.users.findOne({_id: Meteor.user()._id});
      }
    });
  }
},{
  name: 'editaccount'
});
Router.route('/:username/events', function(){
  this.wait([Meteor.subscribe('userByUsername',this.params.username), Meteor.subscribe('allevents')]);
  if (this.ready()){
    this.render('myEvents', {
      data: function(){
        return [Meteor.users.findOne({username: this.params.username}),Events.find()]
      }
    });
  }
},{
  name: 'myEvents'
});
// Additional Codes
