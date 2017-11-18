//公開時間
//new Dateの第二引数(month)は0オリジン
const UNVEIL_DATE = new Date(2017,10,22,0,0,0);

const TIMER_TICK_SEC = 1;

function CountDownTimer(unveilDate,tick){
  this.unveilDate = unveilDate;
  this.tick = tick;

  this.onCountCallback = function(diffTime){};
  this.onUnveilCallback = function(){};

  this.currentTimerId = null;

  this.onCount = function(callback){
    this.onCountCallback = callback;
    return this;
  }

  this.onUnveil = function(callback){
    this.onUnveilCallback = callback;
    return this;
  }

  this.start = function(){
    var currentDateTime = Date.now();
    var unveilDateTime = this.unveilDate.getTime();
    if(unveilDateTime <= currentDateTime){
      //既に公開中
      this.onUnveilCallback();
    }else{
      this.onCountCallback(unveilDateTime - currentDateTime);

      var self = this;
      this.currentTimerId = setInterval(function(){
        currentDateTime = Date.now();
        if(unveilDateTime <= currentDateTime){
          //公開
          self.onUnveilCallback();
          clearInterval(self.currentTimerId);
        }else{
          self.onCountCallback(unveilDateTime - currentDateTime);
        }
      },this.tick * 1000);
    }
  }
}

$(document).ready(function(){
  var $mainPanel = $("#main");
  var $veil = $("#veil");

  var countDownTimer = new CountDownTimer(UNVEIL_DATE,TIMER_TICK_SEC);
  countDownTimer
    .onCount(function(diffTime){
      $veil.show();
      var day = Math.floor(diffTime/(1000*60*60*24));
      diffTime = diffTime - day * (1000*60*60*24);
      var hour = Math.floor(diffTime/(1000*60*60));
      diffTime = diffTime - hour * (1000*60*60);
      var minutes = Math.floor(diffTime/(1000*60));
      diffTime = diffTime - minutes * (1000*60);
      var seconds = Math.floor(diffTime/1000);
      $("#countDownTime").text(day+ " days " + hour + " hours " + minutes + " minutes " + seconds + " seconds.");
    })
    .onUnveil(function(){
      $("body").removeClass("veil");
      $veil.hide();
      $mainPanel.show();
    })
    .start();
});
