/**
 * 状態管理オブジェクトの定義
 * 画面はこの値を参照して描写を変える
 */
const store = {
	debug	: false,
	state	: {
		screenInfo :{
			typing		: '',			// 入力した文字
			isPlaying	: false			// ゲーム開催中
		},
		userInfo : {
			team		: TEAM.INVALID,	// 選択したチーム
			userId		: undefined,	// ユーザID（システムが発番）
			userName	: '',			// ユーザ名
		},
		gameInfo	: undefined,		// ゲームマスターから受け取ったゲーム情報
		input		: {
			roundId		: undefined,	// ラウンドID
			wordsIndex	: -1,			// 現在入力中である単語の配列番号
			startTime	: undefined,	// 入力開始日時
			finishTime	: undefined,	// 入力終了日時
		}
	},

	/**
	 * チームボタン押下
	 * @param {TEAM} team		選択したチーム
	 */
	selectTeam( team )
	{
		this.state.userInfo.team		= team;
		this.state.userInfo.userId		= generateUUID();
	}
};

/**
 * PUBNUBインスタンスの初期化とsubscribe設定
 * publish用にPUBNUBインスタンスをグローバル化（ほかにいい方法ない？）
 */
var pubnub = undefined;
$(document).ready(function(){
	// PUBNUBの初期化処理
	pubnub = PUBNUB.init({
		publish_key:    PUBLISH_KEY,
		subscribe_key:  SUBSCRIBE_KEY
	});

	// PUBNUBからのメッセージをsubscribeし、受け取った際の動作を設定する
	pubnub.subscribe({
		channel: GAME_PROGRESS,
		message: function( message ){
			json = JSON.parse( message );
			console.dir(json);
			switch( json.type )
			{
				case GAME_INFO:			// ゲーム情報
					store.state.gameInfo = json.payload;
					break;
				case GAME_START_COUNT:	// ゲーム開始までのカウントダウン
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						// TODO:カウントダウン表示処理
					}
					break;
				case GAME_FINISH_COUNT:	// ゲーム終了までのカウントダウン
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						// TODO:カウントダウン表示処理
					}
					break;
				case GAME_START:		// ゲーム開始
					if( store.state.gameInfo.roundId === json.payload.roundId ) {
						store.state.screenInfo.isPlaying	= true;
						store.state.input.wordsIndex		= 0;
						store.state.input.startTime			= new Date();
						store.state.input.roundId			= store.state.gameInfo.roundId;
						store.state.screenInfo.typing 		= '';
					}
					break;
				case GAME_FINISH:		// ゲーム終了
					if(store.state.gameInfo.roundId === json.payload.roundId) {
						store.state.screenInfo.isPlaying	= false;
					}
					break;
				default :
					break;
			}
		}
	});

});


/**
* メインのVueコンポーネント
*/
const app = new Vue({
	el 		: "#app",
	data	: store.state,
	methods : {
		selectTeam :		// チーム選択
			function( team ){
				switch(team)
				{
					case '春' :
						store.selectTeam( TEAM.SPRING );
						break;
					case '夏' :
						store.selectTeam( TEAM.SUMMER );
						break;
					case '秋' :
						store.selectTeam( TEAM.AUTUMN );
						break;
					case '冬' :
						store.selectTeam( TEAM.WINTER );
						break;
					default:
						store.selectTeam( TEAM.INVALID );
						break;
				}
			},
		typing :			// タイピング中
			function( value )
			{
				// タイピング課題と入力した文字が一致したらpublishする
				// その後、次の単語データがあれば画面に単語データをセット
				if( ( store.state.gameInfo.words.length > store.state.input.wordsIndex 			)
				&&	( value === store.state.gameInfo.words[store.state.input.wordsIndex].typing ) )
				{
					store.state.input.finishTime = new Date();
					const sendData = {
						type	: INPUT_FINISH,
						payload	: {
							userInfo	: store.state.userInfo,
							input		: store.state.input
						}
					};
					pubnub.publish({
						channel: ANSWER,
						message: JSON.stringify( sendData )
					});

					store.state.input.wordsIndex++;
					store.state.screenInfo.typing = '';
				}
			}
	},
	computed:{
		dispViewWord : function()
		{
			if(	( store.state.input.wordsIndex >= 0									)
			&&	( store.state.gameInfo.words.length > store.state.input.wordsIndex	) )
			{
				return store.state.gameInfo.words[store.state.input.wordsIndex].view;
			}
			else
			{
				return '入力完了！';
			}
		},
		dispTypingWord : function()
		{
			if(	( store.state.input.wordsIndex >= 0									)
			&&	( store.state.gameInfo.words.length > store.state.input.wordsIndex	) )
			{
				return store.state.gameInfo.words[store.state.input.wordsIndex].typing;
			}
			else
			{
				return '';
			}
		}
	}
});