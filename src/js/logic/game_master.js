/**
* 定数定義
*/
	//ラウンド開始前の準備時間(秒)
	const READY_TIME_SEC = 3;
	//コメントの採用率
	const COMMENT_RATIO = 80.0;
	// ランキングの設定値
	const TOTAL_RANKING_COUNT = 10;
	const TEAM_RANKING_COUNT = 5;
	const RANKING_STATUS = {
		OPEN	: "OPEN",						//ランキング表示
		CLOSE	: "CLOSE"						//ランキング非表示
	}

/**
* オブジェクト定義
*/

	/**
	 * 状態管理オブジェクトの定義
	 * 画面はこの値を参照して描写を変える
	 */
	const store = {
		debug	: false,
		state: {
			roundCtlChannel: generateUUID(),
			rounds: {},
			comments: [],
			activeTabName:null,
			ranking: {
				status : RANKING_STATUS.CLOSE
			}
		},
		/**
		* 現在有効なTabを設定する
		* @param {String} activeTabName 有効なタブ名（=roundId）
		*/
		setActiveTabName(activeTabName){
			this.state.activeTabName = activeTabName;
		},
		/**
		* rounds stateを更新する（これをやらないとroundsの変更がvueに反映されない）
		*/
		refreshRounds(){
			this.state.rounds = Object.assign({},this.state.rounds);
		},

		/**
		* roundを追加する
		* @param {Object} roundinfo コントローラから渡されたラウンド情報
		*/
		addRound(roundinfo){
			this.state.rounds[roundinfo.roundId] = Object.assign({},roundinfo,{
				status:ROUND_STATUS.READY,
				remainsSec:roundinfo.limitSec,
				players:{
					SPRING:{},
					SUMMER:{},
					AUTUMN:{},
					WINTER:{}
				},
				score:{
					SPRING:0,
					SUMMER:0,
					AUTUMN:0,
					WINTER:0
				}
			});

			// after-leaveで消せない時があるのでここでコメントを初期化
			this.state.comments = [];

			this.setActiveTabName(roundinfo.roundId);

			this.refreshRounds();
		},

		/**
		* 指定されたラウンドを実行中にする
		* @param {String} roundId 実行中にするラウンドID
		*/
		setRoundRunning(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				if(round.status === ROUND_STATUS.READY){
					round.status = ROUND_STATUS.RUNNING;
					this.refreshRounds();
				}
			}
		},

		/**
		* 残り時間を更新する
		* @param {String} roundId 対象のラウンドID
		* @param {int} remainsSec 更新後の残り時間(秒)
		*/
		updateRemainsSec(roundId,remainsSec){
			var round = this.state.rounds[roundId];
			if(round){
				if(round.status === ROUND_STATUS.RUNNING){
					round.remainsSec = remainsSec;
					this.refreshRounds();
				}
			}
		},

		/**
		* 指定されたラウンドを完了する
		* @param {String} roundId 完了するラウンドID
		*/
		setRoundFinish(roundId){
			var round = this.state.rounds[roundId];
			if(round){
				round.status = ROUND_STATUS.FINISH;
				round.remainsSec = 0;
				this.refreshRounds();
			}
		},

		/**
		* 現在実行中のラウンドを取得する
		* @return {Object} 実行中のラウンド。なければnull。
		*/
		getRunningRound(){
			var self = this;
			var runningRounds = Object.keys(this.state.rounds).map(function(key){
				return self.state.rounds[key];
			}).filter(function(round){
				return round.status === ROUND_STATUS.RUNNING;
			});

			if(runningRounds.length === 1){
				return this.state.rounds[runningRounds[0].roundId];
			}else{
				return null;
			}
		},

		/**
		* ラウンドにplayer情報を設定する
		* @param {string} roundId 対象のラウンドID
		* @param {Object} playerInfo INPUT_FINISHで送信されたplayer情報
		*/
		setPlayer(roundId,playerInfo){
			var round = this.state.rounds[roundId];

			if(round){
				if(round.status === ROUND_STATUS.RUNNING){
					round.players[playerInfo.userInfo.team][playerInfo.userInfo.userId] = playerInfo;
					this.calcScore(roundId);
					this.refreshRounds();

					/**
					 * コメントデータの登録
					 * 縦位置やフォントサイズをランダムで表示
					 */
					if(this._commentLottary()){ //コメントの割合をCOMMENT_RATIOに制限する
						const team = TEAM_LOGO.filter(function (team) {
							return team.key === playerInfo.userInfo.team;
						});
						const config = {
							left: "-100%",	// 最終的には領域外に配置
							top: Math.floor(Math.random() * parseInt(512)) + "px",
							fontSize: (Math.floor(Math.random() * parseInt(16)) + 24) + "px",
							color: team.length === 1 ? team[0].color : 'white'
						};
						this.state.comments.push({
							id: generateUUID(),
							userInfo:playerInfo.userInfo,
							str: round.words[playerInfo.input.wordsIndex].view + '@' + playerInfo.userInfo.userName,
							style: 'position:absolute;font-weight:bold;width:205%;z-index:99999;cursor:default;'
								+ 'text-shadow:black 2px 0px,  black -2px 0px,'
								+ 'black 0px -2px, black 0px 2px,'
								+ 'black 2px 2px , black -2px 2px,'
								+ 'black 2px -2px, black -2px -2px,'
								+ 'black 1px 2px,  black -1px 2px,'
								+ 'black 1px -2px, black -1px -2px,'
								+ 'black 2px 1px,  black -2px 1px,'
								+ 'black 2px -1px, black -2px -1px;'
								+ 'top:' + config.top + ';'
								+ 'left:' + config.left + ';'
								+ 'color:' + config.color + ';'
								+ 'font-size:' + config.fontSize + ';',
							show: true
						})
					}

				}
			}
		},
		/**
		* コメントを表示すべきかどうかの抽選
		* @return {boolean} trueであればコメントを表示する
		*/
		_commentLottary(){
			return COMMENT_RATIO <= Math.random(100) * 100;
		},

		/**
		* 現在のplayer情報からscoreを(再)計算する
		* @param {string} roundId 再計算対象のラウンドID
		*/
		calcScore(roundId){
			var round = this.state.rounds[roundId];

			if(round){
				Object.keys(round.players).forEach(function (team) {
					round.score[team] = Object.keys(round.players[team]).map(function (userId) {
						return round.players[team][userId];
					})
					.map(function (playerInfo) {
						//XXX wordsIndexがzero originである前提
						return playerInfo.input.wordsIndex + 1;
					})
					// GM UIから渡された集計対象人数だけに絞り込む
					.sort(function (a, b) {
						return (b - a);
					}).slice(0, round.aggregateCount)
					.reduce(function (prev, current) {
						return prev + current;
					}, 0);
				});
				this.refreshRounds();
			}
		},

		/**
		 * ラウンド操作用のチャンネル情報を返す
		 */
		getRoundCtlChannel() {
			return this.state.roundCtlChannel;
		},
		/**
		 * コメント用のgetter
		 */
		getComments(){
			return this.state.comments;
		},
		/**
		 * ランキング表示
		 * @param {String} mode 表示モード
		 */
		rankingOpen: function () {
			this.state.ranking.status = RANKING_STATUS.OPEN;
		},
		/**
		 * ランキング非表示
		 */
		rankingClose: function() {
			this.state.ranking.status = RANKING_STATUS.CLOSE;
		},
		/**
		 * ランキングの表示ステータスを返す
		 * @return {String} ランキングの表示ステータス
		 */
		getRankingStatus: function(){
			return this.state.ranking.status;
		},

	};


	/**
	* PubNubへのpublishオブジェクトを返す高階関数
	* @param {Object} pubnub PubNubオブジェクト
	*/
	function Publisher(pubnub){
		return {
			/**
			* ROUND_INFOイベントのpublisher
			* @param {Object} info round情報
			*/
			roundInfo:function(info){
				var sendInfo = {
					type	: ROUND_INFO,
					payload	: info
				};

				pubnub.publish({
					channel: ROUND_PROGRESS,
					message: JSON.stringify( sendInfo )
				});
			},
			/**
			* ROUND_STARTイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			roundStart:function(roundId){
				const sendStart = {
					type	: ROUND_START,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: ROUND_PROGRESS,
					message: JSON.stringify( sendStart )
				});
			},
			/**
			* ROUND_FINISHイベントのpublisher
			* @param {String} roundId ラウンドのID
			*/
			roundFinish:function(roundId){
				const sendData = {
					type	: ROUND_FINISH,
					payload	: {
						roundId	: roundId
					}
				};
				pubnub.publish({
					channel: ROUND_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},
			/**
			* ROUND_START_COUNTイベントのpublisher
			* @param {string} roundId 対象のroundId
			* @param {int} remainsSec 残り時間(秒)
			*/
			roundStartCount(roundId,remainsSec){
				const sendData = {
					type: ROUND_START_COUNT,
					payload:{
						roundId : roundId,
						remainsSec : remainsSec
					}
				};

				pubnub.publish({
					channel: ROUND_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},

			/**
			* ROUND_FINISH_COUNTイベントのpublisher
			* @param {string} roundId 対象のラウンドID
			* @param {int} remainsSec 残り時間(秒)
			*/
			roundFinishCount(roundId,remainsSec){
				const sendData = {
					type: ROUND_FINISH_COUNT,
					payload:{
						roundId: roundId,
						remainsSec: remainsSec
					}
				};

				pubnub.publish({
					channel: ROUND_PROGRESS,
					message: JSON.stringify( sendData )
				});
			},
		};
	}

	/**
	* PubNubからのsubscribe時のイベント群を返す高階関数
	* @param {Object} store storeオブジェクト
	* @param {Object} publisher Publisherオブジェクト
	* @param {function} idGenerator UUID作成関数
	* @param {Object} roundTimeKeeperManager RoundTimeKeeperManagerインスタンス
	*/
	function SubscribeEvents(store,publisher,idGenerator,roundTimeKeeperManager){
		return {
			/**
			* ROUND_STARTイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameStart:function(message){
				/**
				 * ①ラウンドの情報をpublish
				 * ②開始までのカウントダウンをpublish
				 * ③ラウンド開始をpublish
				 * ④試合時間を過ぎたらラウンド終了をpublish
				 */
				var roundInfo = message.payload;
				var roundId = idGenerator();
				roundInfo.roundId	= roundId;

				var roundTimeKeeper = roundTimeKeeperManager.new(roundInfo.limitSec);

				roundTimeKeeper
					.onReady(function(){
						store.addRound(roundInfo);
						publisher.roundInfo(roundInfo);
						publisher.roundStartCount(roundId,READY_TIME_SEC);
					})
					.onTimeProceed(function(readySec,roundSec){
						if(readySec > 0){
							publisher.roundStartCount(roundId,readySec);
						}else if(roundSec > 0){
							store.updateRemainsSec(roundId, roundSec);
							publisher.roundFinishCount(roundId, roundSec);
						}
					})
					.onStart(function(){
						store.setRoundRunning(roundId);
						publisher.roundStart(roundId);
					})
					.onEnd(function(){
						store.setRoundFinish(roundId);
						publisher.roundFinish(roundId);
					})
					.start();
			},
			/**
			* ROUND_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onGameFinish:function(message){
				var roundTimeKeeper = roundTimeKeeperManager.get();

				if(roundTimeKeeper){
					roundTimeKeeper.stop();
				}
			},
			/**
			* INPUT_FINISHイベントのハンドラ
			* @param {Object} message イベントメッセージ
			*/
			onInputFinish:function(message){
				store.setPlayer(message.payload.input.roundId,message.payload);
			},
			/**
			 * ランキング表示イベントのハンドラ
    	   	 * @param {Object} message イベントメッセージ
			 */
			onRankingOpen:function (message) {
				store.rankingOpen(message.payload.mode);
			},
			/**
			 * ランキングクローズイベントのハンドラ
			 * @param {Object} message イベントメッセージ
			 */
			onRankingClose:function (mesage) {
				store.rankingClose();
			}
  		};
	}
	/**
	* ラウンド時間のタイムキーパーオブジェクト
	* @param {int} readySec 準備時間(秒)
	* @param {int} roundSec ラウンド実行時間(秒)
	*/
	function RoundTimeKeeper(readySec,roundSec){
		//準備時間
		this.readySec = readySec;
		//ラウンド実行時間
		this.roundSec = roundSec;
		//タイマーのtick
		this.deltaSec = 1;

		//準備時間に入った時のcallback
		this.onReadyCallback = function(){};
		//ラウンド開始した際のcallback
		this.onStartCallback = function(){};
		//ラウンド終了した際のcallback
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
		* ラウンド開始callbackの設定メソッド
		* @param {function} cb callback
		* @return this(メソッドチェーン)
		*/
		this.onStart = function(cb){
			this.onStartCallback = cb;
			return this;
		}

		/**
		* ラウンド終了callbackの設定メソッド
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

			var self = this;
			this.currentTimerId = setInterval(
				function(){
					if(self.readySec > 0){
						//準備中
						self.readySec = self.readySec - 1;
						self.onTimeProceedCallback(self.readySec,self.roundSec);
						if(self.readySec === 0){
							self.onStartCallback();
						}
					}else if(self.roundSec > 0){
						//実行中
						self.roundSec = self.roundSec - 1;
						self.onTimeProceedCallback(self.readySec,self.roundSec);
						if(self.roundSec === 0){
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
	* RoundTimeKeeperのインスタンス管理オブジェクト
	* @param {int} readySec 準備時間（秒）
	*/
	function RoundTimeKeeperManager(readySec){
		//RoundTimeKeeperインスタンス
		this.instance = null;

		/**
		* 既存のインスタンスを破棄して新しいインスタンスを作成する
		* @return {Object} RoundTimeKeeperインスタンス
		*/
		this.new = function(roundSec){
			if(this.instance){
				this.instance.stop();
				this.instance = null;
			}

			this.instance = new RoundTimeKeeper(readySec,roundSec);
			return this.instance;
		}

		/**
		* 既存のインスタンスを取得する
		* @return {Object} RoundTimeKeeperインスタンス　or null
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
			methods: {
				handleTabClick: function (tab) {
					store.setActiveTabName(tab.name);
				},
				remainsTimeOf: function (roundId) {
					var remainsSec = this.rounds[roundId].remainsSec;
					return Math.floor(remainsSec / 60) + ":" + ("0" + (remainsSec % 60).toString()).substr(-2, 2);
				},
				/**
				* 指定されたroundで有効なteamを返す
				* @param {string} roundId ラウンドID
				* @return {Array} チームキーの配列
				*/
				getTeamsOf: function (roundId) {
					return Object.keys(this.rounds[roundId].score);
				},
				/**
				* 指定されたround,teamのスコアを返す
				* @param {string} roundId ラウンドID
				* @param {string} team チームキー
				* @return {int} 当該ラウンドの当該チームのスコア
				*/
				getScoreOf: function (roundId, team) {
					return this.rounds[roundId].score[team];
				},
				/**
				* 指定されたround,teamの上位10名のID,名前,スコアを返す
				* @param {string} roundId ラウンドID
				* @param {string} team チームキー
				* @return {{userId:string,userName:string,score:int,rank:int}} Top10のユーザー情報（スコアの降順）
				*/
				getTopPlayersOf(roundId, team) {
					var self = this;
					return Object.keys(this.rounds[roundId].players[team]).map(function (userId) {
						return self.rounds[roundId].players[team][userId];
					}).map(function (playerInfo) {
						return {
							userId: playerInfo.userInfo.userId,
							userName: playerInfo.userInfo.userName,
							score: playerInfo.input.wordsIndex + 1,
							finishTime: playerInfo.input.finishTime
						};
					}).sort(function (a, b) {
						var scoreDiff = b.score - a.score;
						//スコアに差があればそれを採用
						if (scoreDiff !== 0) {
							return scoreDiff
						} else {
							//スコアに差が無い場合は、finishTimeの昇順（≒早い順）
							return Date.parse(a.finishTime) - Date.parse(b.finishTime);
						}
					}).slice(0, 10)
						.map(function (player, idx) {
							return Object.assign({}, player, { rank: idx + 1 });
						})
				},
				/**
				* 指定されたチームのロゴのパスを取得する
				* @param {string} team チームキー
				* @return {string} ロゴへの相対パス
				*/
				getTeamLogoPath: function (key) {
					const team = TEAM_LOGO.filter(function (team) {
						return team.key === key;
					});

					if (team.length === 1) {
						return team[0].image;
					}
					else {
						return '';
					}
				},
				/**
				 * コメントが追加された後のイベント
				 * すぐに非表示にする
				 * @param {object} el コメントのdivエレメント
				 */
				apperComment: function (el) {
					store.state.comments.some(function (v, i) {
						if (v.id == el.id) store.state.comments[i].show = false;
					});
				},
				/**
				 * コメントがフェードアウトした時のイベント
				 * 対象のコメントを削除する
				 * @param {object} el コメントのdivエレメント
				 */
				leaveComment: function (el) {
					/* 大量にコメントが流れると上手く消えないケースがあるので、ROUND_READYでクリアすることにする。
					store.state.comments.some(function (v, i) {
						if (v.id == el.id) store.state.comments.splice(i, 1);
					});
					*/
				},
				getTeamRanking: function () {
					if (store.getRankingStatus() !== RANKING_STATUS.OPEN)
					{
						return false;
					}

					var self = this;
					var totalRanking = [];
					// ラウンドループ
					Object.keys(this.rounds).forEach(function (roundId, roundIndex) {
						// チームループ
						Object.keys(self.rounds[roundId].players).forEach(function (team) {
							const roundRank = Object.keys(self.rounds[roundId].players[team]).map(function (userId) {
								return self.rounds[roundId].players[team][userId];
							}).map(function (playerInfo) {
								return {
									userInfo: playerInfo.userInfo,
									score: playerInfo.input.wordsIndex + 1,
									finishTime: playerInfo.input.finishTime
								};
							})
							.map(function (player, idx) {
								// 今回のイベント特性上複数回参加しているかは考慮しない（あと勝ちにする）
								totalRanking[player.userInfo.userId] = player;
							});
						})
					});

					totalRanking = Object.keys(totalRanking).map(function (value) {
							return totalRanking[value];
						}).sort(function (a, b) {
							var scoreDiff = b.score - a.score;
							//スコアに差があればそれを採用
							if (scoreDiff !== 0) {
								return scoreDiff
							} else {
								//スコアに差が無い場合は、finishTimeの昇順（≒早い順）
								return Date.parse(a.finishTime) - Date.parse(b.finishTime);
							}
						});

					return {
						SPRING: totalRanking.filter(function (value) { return value.userInfo.team === TEAM.SPRING }).slice(0, TEAM_RANKING_COUNT),
						SUMMER: totalRanking.filter(function (value) { return value.userInfo.team === TEAM.SUMMER }).slice(0, TEAM_RANKING_COUNT),
						AUTUMN: totalRanking.filter(function (value) { return value.userInfo.team === TEAM.AUTUMN }).slice(0, TEAM_RANKING_COUNT),
						WINTER: totalRanking.filter(function (value) { return value.userInfo.team === TEAM.WINTER }).slice(0, TEAM_RANKING_COUNT)
					};
				}
			},
			computed: {
				/**
				* ラウンド情報が存在するかどうか
				* @return {boolean} １つでも存在すればTrue
				*/
				hasRound : function(){
					return Object.keys(this.rounds).length > 0;
				},
				/**
				* roundsを配列に変換したリストを返す
				* {roundId:{roundId:"...",score:{...},...}} => [{roundId:"...",score:{...},...},{roundId:"...",score:{...},...}]
				* @return {Array} 各ラウンドが格納された配列
				*/
				roundsArray : function(){
					var self = this;
					return Object.keys(this.rounds).map(function(key){return self.rounds[key]});
				},
				/**
				 * Controllerへのリンクを生成
				 */
				getControllerUrl : function () {
					return './gm_ui.html?' + store.getRoundCtlChannel();
				},
				/**
				 * コメントを表示するかの判定
				 */
				hasViewComment: function () {
					return store.getComments().filter(function (v) { return v.show; }).length > 0;
				},
				/**
				 * チームランキング表示判定
				 * @return {bool} チームランキング表示フラグ
				 */
				hasShowTeamRanking: function () {
					return store.getRankingStatus() === RANKING_STATUS.OPEN;
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

		const roundTimeKeeperManager = new RoundTimeKeeperManager(READY_TIME_SEC);

		//PUBNUBからのsubscribe時のイベント群
		const subscribeEvents = SubscribeEvents(store,publisher,generateUUID,roundTimeKeeperManager);

		/**
		* PubNub制御
		*/

		// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
		// Game Master操作用画面からpublishを受け取る
		pubnub.subscribe({
			channel: store.getRoundCtlChannel(),
			message: function( message ){
				json = JSON.parse(message);
				console.log(json.type);
				console.dir(json);
				switch( json.type )
				{
					case ROUND_START:		// ラウンド開始
						subscribeEvents.onGameStart(json);
						break;
					case ROUND_FINISH:		// ラウンド終了
						subscribeEvents.onGameFinish(json);
						break;
					case RANKING_OPEN:
						subscribeEvents.onRankingOpen(json);
						break;
					case RANKING_CLOSE:
						subscribeEvents.onRankingClose(json);
						break;
					default :
						break;
				}
			}
		});

		// プレイヤー画面からのメッセージを受け取る
		pubnub.subscribe({
			channel: ANSWER,
			message: function( message ){
				json = JSON.parse( message );
				console.log(json.type);
				console.dir(json);
				switch( json.type )
				{
					case INPUT_FINISH:		// 単語入力完了
						subscribeEvents.onInputFinish(json);
						break;
					default :
						break;
				}
			}
		});
	}
