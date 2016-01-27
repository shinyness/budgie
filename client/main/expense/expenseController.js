angular.module('expense.controller', [])
.controller('ExpenseController', function(ExpenseServices, $http){
	var expense = this;




	expense.expenseTable = [];
	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous'];
	var dailyArr = [0,0,0,0,0,0,0,0,0,0,0,0];
	var weeklyArr = [0,0,0,0,0,0,0,0,0,0,0,0];
	var monthlyArr = [0,0,0,0,0,0,0,0,0,0,0,0];


	var monthlyLineArr = [], monthlyDaysArr = [], lastMonthArr = [];

	var startDay;
	var startWeek;
	var startMonth;

	(function(){
		ExpenseServices.getExpensesForDays(60)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);
			var today = moment().format("DD");
			console.log("this is today", today);
			for(var i=0; i<resp.length; i++){
				var day = resp[i].spent_date.slice(8,10);
				console.log("this is day in for loop", day);
				if(day === today){
					resp[i].format = moment(resp[i].spent_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
					console.log("moment difference as .format", resp[i].format);
					expense.expenseTable.push(resp[i]);
					var category = resp[i].category;
					var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
					dailyArr[index] += Number(resp[i].amount);
				}else{
					break;
				}
			}


			var thisWeek = moment().format("w");
			for(var j=0; j<resp.length; j++){
				var week = moment(resp[j].spent_date, 'YYYY-MM-DD HH:mm:ss').format("w");
				if(week === thisWeek){
					var category = resp[j].category;
					var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
					weeklyArr[index] += Number(resp[j].amount);
				}else{
					break;
				}
			}

			var thisMonth = moment().format("M");
			var lastMonth = moment().subtract(1, 'months').format("M");
			var daysInThisMonth = moment().daysInMonth();
			for(var a = 0; a<daysInThisMonth; a++){
				monthlyLineArr.push(null);
				lastMonthArr.push(null);
				monthlyDaysArr.push(a + 1);
			}

			for(var k=0; k<resp.length; k++){
				var month = moment(resp[k].spent_date, 'YYYY-MM-DD HH:mm:ss').format("M");
				var category = resp[k].category;
				var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
				if(month === thisMonth){
					monthlyArr[index] += Number(resp[k].amount);
					monthlyLineArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount;
				}else if(month === lastMonth){
					lastMonthArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount;
				}
			}

			console.log("this is dailyArr!!!!", dailyArr);
			console.log("this is weeklyArr!!!!", weeklyArr);
			console.log("this is monthlyArr!!!!", monthlyArr);
			console.log("this is monthlyLineArr!!!!", monthlyLineArr);
			console.log("this is lastMonthArr!!!!", lastMonthArr);

			new Chartist.Bar('#progressBarChart', dataProgressBar, optionsProgressBar);
			new Chartist.Pie('#dailyDonutChart', dataDailyDonutChart, optionsDailyDonutChart);
			new Chartist.Pie('#weeklyDonutChart', dataWeeklyDonutChart, optionsWeeklyDonutChart);
			new Chartist.Pie('#monthlyDonutChart', dataMonthlyDonutChart, optionsMonthlyDonutChart);
			new Chartist.Line('#monthlyLineChart', dataMonthlyLineChart, optionsMonthlyLineChart);
			new Chartist.Bar('#dailyBarChart', dataDailyBarChart, optionsDailyBarChart);
		});
	})();

	expense.addExpense = function(){
		var spentDate = moment();

		var hours = time.value.split(':')[0];
		var minutes = time.value.split(':')[1];

		spentDate.hour(Number(hours));
		spentDate.minute(Number(minutes));

		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');

		console.log("this is spentDate in string format", spentDate);
		console.log("this is hours and minutes", hours, minutes);

		ExpenseServices.submitNewExpense({'amount':amount.value, 'name':expenseItem.value, 'category':category.value, 'spent_date':spentDate, 'notes':notes.value})
		.then(function(resp){
			// expense.expenseTable.push({'amount':amount.value, 'name':expenseItem.value, 'category':category.value, 'spent_date':time.value, 'notes':notes.value});
			console.log("This is expenseTable", expense.expenseTable);
		});


	};

	expense.removeRow = function(idx, id){
		expense.expenseTable.splice(idx, 1);
		ExpenseServices.deleteExpense(id);
	};

	var dataProgressBar = {
		labels: [''],
		series: [[43],[7]] //first array is how much we have left to get to the goal, the second array is how much weve saved so far.
	};
	var optionsProgressBar = {
		reverseData: true,
		horizontalBars: true,
		stackBars: true,
		fullWidth: true,
		seriesBarDistance: 0,
		height: "20px",
		low: 0,
		high: 50, //price of goal
		axisX: {
			showLabel: false,
			showGrid: false
		},
		axisY: {
			showLabel: false,
			showGrid: false,
		}
	};

	var dataDailyDonutChart = {
    series : dailyArr, //expense amount per category
    labels : categories //catergory name
  };
  var optionsDailyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataWeeklyDonutChart = {
    series: weeklyArr, //expense amount per category
    labels: categories //catergory name
  };
  var optionsWeeklyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataMonthlyDonutChart = {
    series: monthlyArr, //expense amount per category
    labels: categories //catergory name
  };
  var optionsMonthlyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataMonthlyLineChart = {
		labels: monthlyDaysArr,
		series: [monthlyLineArr,lastMonthArr] //daily expenditure total values
	};
	var optionsMonthlyLineChart = {
		fullWidth: true,
		chartPadding: {
			right: 40
		},
		showArea: true,
		height: '350px'
	};

	var dataDailyBarChart = {
		labels: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    series: [
      [3, 2, 9, 5, 4, 6, 4]
    ]
	};
	var optionsDailyBarChart = {
		fullWidth: true,
		seriesBarDistance: 10
	};



});
