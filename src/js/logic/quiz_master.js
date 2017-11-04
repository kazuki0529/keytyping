/**
* 定数定義
*/
	//問題開始前の準備時間(秒)
	const READY_TIME_SEC = 0;

/**
* オブジェクト定義
*/
  /**
   * 状態管理オブジェクトの定義
   * 画面はこの値を参照して描写を変える
   */
  const store = {
    state:{
      questionCtlChannel:generateUUID(),
      questions:{

      },
			survivors:{
				SPRING:[],
				SUMMER:[],
				AUTUMN:[],
				WINTER:[]
			}
    },
		/**
		* questions stateを更新する（これをやらないとquestionsの変更がvueに反映されない）
		*/
		refreshQuestions:function(){
			this.state.questions = Object.assign({},this.state.questions);
		},
    /**
    * 問題を追加する
    * @param {Object} questionInfo 問題情報
    */
    addQuestion:function(questionInfo){
			this.state.questions[questionInfo.questionId] = Object.assign({},questionInfo,{
				status:QUIZ_STATUS.READY,
				remainsSec:questionInfo.limitSec,
				panelers:{
					SPRING:{},
					SUMMER:{},
					AUTUMN:{},
					WINTER:{}
				}
			});

			this.refreshQuestions();
    },
    /**
    * 問題を実行中にする
    * @param {String} questionId 問題ID
    */
    setQuestionRunning:function(questionId){
			var question = this.state.questions[questionId];
			if(question){
				if(question.status === QUIZ_STATUS.READY){
					this.state.questions[questionId].status = QUIZ_STATUS.RUNNING;
					this.refreshQuestions();
				}
			}
    },
    /**
    * 問題の残り時間を更新する
    * @param {String} questionId 問題ID
    * @param {int} remainsSec 更新後の残り時間
    */
    updateRemainsSec:function(questionId,remainsSec){
			var question = this.state.questions[questionId];

			if(question){
				if(question.status === QUIZ_STATUS.RUNNING){
					this.state.questions[questionId].remainsSec = remainsSec;
					this.refreshQuestions();
				}
			}
    },
    /**
    * 問題を完了する
    * @param {String} questionId 問題ID
    */
    setQuestionFinish:function(questionId){
			var question = this.state.questions[questionId];

			if(question){
				this.state.questions[questionId].status = QUIZ_STATUS.FINISH;
				this.state.questions[questionId].remainsSec = 0;
				this.refreshQuestions();
			}
    },
    /**
    * 完了した問題の結果を公開する
    */
    setQuestionResultOpen:function(){
			var self = this;
      Object.keys(this.state.questions).forEach(function(questionId){
				if(self.state.questions[questionId].status === QUIZ_STATUS.FINISH){
					self.state.questions[questionId].status = QUIZ_STATUS.RESULT_OPENED;
				}
			});

			this.refreshQuestions();
    },
    /**
    * 指定された問題終了時点での全問正解者リストを表示する
    * @param {String} questionId 問題ID
    * @return {Object} 全問正解者リスト
    */
    getSurvivorsOf:function(questionId){
			var question = this.state.questions[questionId];

			if(question){
				if(question.status === QUIZ_STATUS.FINISH){
					this.checkSurvivors(questionId);
		      return this.state.questions[questionId].survivors;
				}
			}
    },
    /**
    * 問題に回答者情報を設定する
    * @param {String} questionId 問題ID
    * @param {Object} panelerInfo 回答者情報
    */
    setPaneler(questionId,panelerInfo){
			var question = this.state.questions[questionId];

			if(question){
				if(question.status === QUIZ_STATUS.RUNNING && this.isSurvivor(panelerInfo.userInfo.userId)){
					this.state.questions[questionId].panelers[panelerInfo.userInfo.team][panelerInfo.userInfo.userId] = panelerInfo;
					this.refreshQuestions();
				}
			}
    },
		/**
		* 対象のユーザーが全問正解者か判定する
		* @param {String} userId ユーザーID
		* @return {boolean} 全問正解者であればtrue
		*/
		isSurvivor:function(userId){
			if(Object.keys(this.state.questions) === 1){
				//1問目はまだ脱落者なし
				return true;
			}else{
				var allSurvivorsId = Object.keys(this.state.survivors)
					.map(function(team){
						return this.state.survivors[team].map(function(userInfo){
							return userInfo.userId;
						});
					}) // [[a,b,c],[d,e,f],[g,h],[i]]の形式になっているのでreduceする
					.reduce(function(prev,next){
						return prev.concat(next);
					},[]);

				return allSurvivorsId.indexOf(userId) >= 0;
			}
		},
		/**
		* 問題の正解者を確認する
		* @param {String} questionId 問題ID
		*/
		checkSurvivors:function(questionId){
			var question = this.state.questions[questionId];

			if(question){
				var self = this;
				Object.keys(question.panelers).forEach(function(team){
					self.state.survivors[team] = Object.keys(question.panelers[team]).map(function(userId){
						return question.panelers[team][userId];
					})
					.filter(function(panelerInfo){
						//正解者のみに絞り込む
						return question.selections[panelerInfo.answer.selectIndex].isCorrect;
					})
					.map(function(panelerInfo){
						//userInfoのみ格納する
						return panelerInfo.playerInfo;
					})
				});

				this.state.survivors = Object.assign({},this.state.survivors);
			}
		},
    /**
		 * 問題操作用のチャンネル情報を返す
     * @return {String} 問題操作用チャンネル
		 */
    getQuestionCtlChannel:function(){
      return this.state.questionCtlChannel;
    }
  }

  /**
	* PubNubへのpublishオブジェクトを返す高階関数
	* @param {Object} pubnub PubNubオブジェクト
	*/
	function Publisher(pubnub){
    return {
      /**
      * QUESTION_INFOイベントのPublisher
      * @param {Object} info 問題情報
      */
      questionInfo:function(info){
        var sendInfo = {
          type:QUESTION_INFO,
          payload:info
        };

        pubnub.publish({
          channel:QUIZ_PROGRESS,
          message: JSON.stringify(sendInfo)
        });
      },
      /**
      * QUESTION_START_COUNTイベントのPublisher
      * @param {String} questionId 問題ID
      * @param {int} remainsSec 残り秒数
      */
      questionStartCount:function(questionId,remainsSec){
        var sendInfo = {
          type:QUESTION_START,
          payload:{
            questionId:questionId,
            remainsSec:remainsSec
          }
        };

        pubnub.publish({
          channel:QUIZ_PROGRESS,
          message:JSON.stringify(sendInfo)
        });
      },
      /**
      * QUESTION_STARTイベントのpublisher
      * @param {String} questionId 問題ID
      */
      questionStart:function(questionId){
        var sendInfo = {
          type:QUESTION_START,
          payload:{
            questionId:questionId
          }
        };

        pubnub.publish({
          channel:QUIZ_PROGRESS,
          message:JSON.stringify(sendInfo)
        });
      },
      /**
      * QUESTION_FINISH_COUNTイベントのpubliher
      * @param {String} questionId 問題ID
      * @param {int} remainsSec 残り秒数
      */
      questionFinishCount:function(questionId,remainsSec){
        var sendInfo = {
          type:QUESTION_FINISH_COUNT,
          payload:{
            questionId:questionId,
            remainsSec:remainsSec
          }
        };

        pubnub.publish({
          channel:QUIZ_PROGRESS,
          message:JSON.stringify(sendInfo)
        });
      },
      /**
      * QUESTION_FINISHイベントのpublisher
      * @param {String} questionId 問題ID
      * @param {Object} survivors 全問正解者リスト
      */
      questionFinish:function(questionId,survivors){
        var sendInfo = {
          type:QUESTION_FINISH,
          payload:{
            questionId:questionId,
            survivors:survivors
          }
        };

        pubnub.publish({
          channel:QUIZ_PROGRESS,
          message:JSON.stringify(sendInfo)
        });
      }
    }
  }

  /**
	* PubNubからのsubscribe時のイベント群を返す高階関数
	* @param {Object} store storeオブジェクト
	* @param {Object} publisher Publisherオブジェクト
	* @param {function} idGenerator UUID作成関数
	* @param {Object} questionTimeKeeperManager QuestionTimeKeeperManagerインスタンス
	*/
	function SubscribeEvents(store,publisher,idGenerator,questionTimeKeeperManager){
    return {
      /**
      * QUESTION_STARTイベントのハンドラ
      * @param {Object} message イベントメッセージ
      */
      onQuestionStart:function(message){
        var questionInfo = message.payload;
        var questionId = generateUUID();
        questionInfo.questionId = questionId;

        var questionTimeKeeper = questionTimeKeeperManager.new(questionInfo.limitSec);

        questionTimeKeeper
          .onReady(function(){
            store.addQuestion(questionInfo);
            publisher.questionInfo(questionInfo);
            publisher.questionStartCount(questionId,READY_TIME_SEC);
          })
          .onTimeProceed(function(readySec,roundSec){
            if(readySec > 0){
              publisher.questionStartCount(questionId,readySec);
            }else if(roundSec > 0){
              store.updateRemainsSec(questionId, roundSec);
              publisher.questionFinishCount(questionId, roundSec);
            }
          })
          .onStart(function(){
            store.setQuestionRunning(questionId);
						publisher.questionStart(questionId);
          })
          .onEnd(function(){
            store.setQuestionFinish(questionId);
            var survivors = store.getSurvivorsOf(questionId);
            publisher.questionFinish(questionId,survivors);
          })
          .start();

      },
      /**
      * QUESTION_FINISHイベントのハンドラ
      */
      onQuestionFinish:function(){
        var questionTimeKeeper = questionTimeKeeperManager.get();

        if(questionTimeKeeper){
          questionTimeKeeper.stop();
        }
      },
      /**
      * RESULTイベントのハンドラ
      */
      onResult:function(){
        store.setQuestionResultOpen();
      },
      /**
      * ANSWERイベントのハンドラ
      * @param {Object} message イベントメッセージ
      */
      onAnswer:function(message){
        store.addQuestion(message);
      }
    };
  }

  /**
	* 問題時間のタイムキーパーオブジェクト
	* @param {int} readySec 準備時間(秒)
	* @param {int} questionSec 問題実行時間(秒)
	*/
	function QuestionTimeKeeper(readySec,questionSec){
		//準備時間
		this.readySec = readySec;
		//問題実行時間
		this.questionSec = questionSec;
		//タイマーのtick
		this.deltaSec = 1;

		//準備時間に入った時のcallback
		this.onReadyCallback = function(){};
		//問題開始した際のcallback
		this.onStartCallback = function(){};
		//問題終了した際のcallback
		this.onEndCallback = function(){};
		//時間が経過した際のcallback
		this.onTimeProceedCallback = function(){};

		//jsのタイマーID
		this.currentTimerId = null;

		/**
		* 準備時間callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onReady = function(cb){
			this.onReadyCallback = cb;
			return this;
		}

		/**
		* 問題開始callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onStart = function(cb){
			this.onStartCallback = cb;
			return this;
		}

		/**
		* 問題終了callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onEnd = function(cb){
			this.onEndCallback = cb;
			return this;
		}

		/**
		* 時間経過callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onTimeProceed = function(cb){
			this.onTimeProceedCallback = cb;
			return this;
		}

		/**
		* タイマースタート
		*/
		this.start = function(){
			this.onReadyCallback();
			if(this.readySec === 0){
				this.onStartCallback();
			}

			var self = this;
			this.currentTimerId = setInterval(
				function(){
					if(self.readySec > 0){
						//準備中
						self.readySec = self.readySec - 1;
						self.onTimeProceedCallback(self.readySec,self.questionSec);
						if(self.readySec === 0){
							self.onStartCallback();
						}
					}else if(self.questionSec > 0){
						//実行中
						self.questionSec = self.questionSec - 1;
						self.onTimeProceedCallback(self.readySec,self.questionSec);
						if(self.questionSec === 0){
							self.onEndCallback();
						}
					}else{
						self.stopTimer();
					}
				}
				,this.deltaSec * 1000
			)
		}

		/**
		* タイマー(強制)ストップ
		*/
		this.stop = function(){
			if(this.currentTimerId){
				this.stopTimer();
				this.onEndCallback();
			}
		}

		/**
		* jsのタイマー処理のクリア
		*/
		this.stopTimer = function(){
			clearInterval(this.currentTimerId);
			this.currentTimerId = null;
		}
	}

	/**
	* QuestionTimeKeeperのインスタンス管理オブジェクト
	* @param {int} readySec 準備時間（秒）
	*/
	function QuestionTimeKeeperManager(readySec){
		//QuestionTimeKeeperインスタンス
		this.instance = null;

		/**
		* 既存のインスタンスを破棄して新しいインスタンスを作成する
		* @return {Object} QuestionTimeKeeperインスタンス
		*/
		this.new = function(questionSec){
			if(this.instance){
				this.instance.stop();
				this.instance = null;
			}

			this.instance = new QuestionTimeKeeper(readySec,questionSec);
			return this.instance;
		}

		/**
		* 既存のインスタンスを取得する
		* @return {Object} QuestionTimeKeeperインスタンス　or null
		*/
		this.get = function(){
			return this.instance;
		}
	}

/**
* メイン処理
*/

  //unit test時は実行しない
	if(location.href.indexOf("test") === -1){
    /**
    * メインのVueコンポーネント
    */
    const app = new Vue({
      el 		: "#app",
      data	: store.state,
      methods : {},
      computed: {
        /**
         * Controllerへのリンクを生成
         */
        getControllerUrl : function () {
          return './qm_ui.html?' + store.getQuestionCtlChannel();
        }
      }
    });

    /**
     * PUBNUBインスタンスの初期化とsubscribe設定
     */
    // PUBNUBの初期化処理
    var pubnub = PUBNUB.init({
      publish_key:    PUBLISH_KEY,
      subscribe_key:  SUBSCRIBE_KEY
    });

    //PubNubへのpublishオブジェクトのインスタンス
    const publisher = Publisher(pubnub);

    const questionTimeKeeperManager = new QuestionTimeKeeperManager(READY_TIME_SEC);

    //PUBNUBからのsubscribe時のイベント群
    const subscribeEvents = SubscribeEvents(store,publisher,generateUUID,questionTimeKeeperManager);


    // PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
    // Game Master操作用画面からpublishを受け取る
    pubnub.subscribe({
      channel: store.getQuestionCtlChannel(),
      message: function( message ){
        json = JSON.parse( message );
        console.dir(json);
        switch( json.type )
        {
          case QUESTION_START:
            subscribeEvents.onQuestionStart(json);
            break;
          case QUESTION_FINISH:
            subscribeEvents.onQuestionFinish(json);
            break;
          case RESULT:
            subscribeEvents.onResult(json);
            break;
          default :
            break;
        }
      }
    });

    // パネラー画面からのメッセージを受け取る
    pubnub.subscribe({
      channel: QUIZ_ANSWER,
      message: function( message ){
        json = JSON.parse( message );
        console.dir(json);
        switch( json.type )
        {
          case ANSWER:
            subscribeEvents.onAnswer(json);
            break;
          default :
            break;
        }
      }
    });
  }
