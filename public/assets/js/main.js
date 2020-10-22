new Vue({
  el: '#main',
  data: {
    problems: [],
    status: [],
    problemStr: '',
    updateStatus: 'Idle',
    nextUpdate: 1,
    winner: null
  },
  // computed: {
  //   problemStr() { 
  //     return this.problems ? this.problems.map(problem => `${problem.url.split('/').reverse()[2]}:${problem.problem}`).join(',') : '';
  //   }
  // },
  methods: {
    judge(problemStr, startTime, participant1, participant2) {
      return axios('/judge', { 
        params: {
          problems: problemStr,
          startTime,
          participant1,
          participant2
        }
      });
    },
    getProblemsInfo(problemStr) {
      return axios('/problemsInfo', {
        params: {
          problems: problemStr
        }
      });
    },
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    checkWinner(board) {
      // Check rows
      for (let i = 0; i < board.length; i++) {
        let count = 0;
        let curr = board[i][0];

        for (let j = 0; j < board[i].length; j++) {
          if (board[i][j] !== curr) count = 0;

          curr = board[i][j];

          count++;
        }

        if (count == 3 && curr) return curr;
      }

      // Check cols
      for (let j = 0; j < board.length; j++) {
        let count = 0;
        let curr = board[0][j];

        for (let i = 0; i < board[j].length; i++) {
          if (board[i][j] !== curr) count = 0;

          curr = board[i][j];

          count++;
        }

        if (count == 3 && curr) return curr;
      }

      let count = 0;
      let curr = board[0][0];

      for (let i = 0; i < board.length; i++) {

        if (board[i][i] !== curr) count = 0;

        curr = board[i][i];

        count++;
      }

      if (count == 3 && curr) return curr;

      count = 0;
      curr = board[1][1];

      for (let i = 0; i < board.length; i++) {
        if (board[i][board.length - i - 1] !== curr) count = 0;

        curr = board[i][i];

        count++;
      }

      if (count == 3 && curr) return curr;

      return null;
    },
    stats(judgeResult) {
      let clonedJudgeResult = this.deepClone(judgeResult).map((item, i) => {
        item.index = i;

        return item;        
      });

      let board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ];

      clonedJudgeResult.sort((a, b) => a.submissionTime - b.submissionTime);

      for (let move of clonedJudgeResult) {
        let row = ~~(move.index / 3);
        let col = move.index % 3;

        board[row][col] = move.user;

        let winner = this.checkWinner(board);

        if (winner !== null) return winner;
      }

      return null;
    },
    async update() {
      this.updateStatus = 'Updating...';

      let problemsInfo = await this.getProblemsInfo(this.problemStr);
      
      this.problems = problemsInfo.data.data;

      let judgeResult = await this.judge(this.problemStr, this.startTime, this.participant1, this.participant2);

      this.status = judgeResult.data.data;

      this.winner = this.stats(this.status);

      this.updateStatus = 'Idle';
    },
    async scheduleUpdate() {
      while (this.nextUpdate > 0) {
        this.nextUpdate--;
        await new Promise(cb => setTimeout(() => cb(), 1000));
      }

      await this.update();

      this.nextUpdate = 10;

      this.scheduleUpdate();
    }
  },
  mounted() {
    let querystring = new URLSearchParams(window.location.search);
    
    this.problemStr = querystring.get('problems');
    this.participant1 = querystring.get('participant1');
    this.participant2 = querystring.get('participant2');
    this.startTime = querystring.get('startTime') || Date.now() - 60 * 60 * 1000; 

    this.scheduleUpdate();
  }
})