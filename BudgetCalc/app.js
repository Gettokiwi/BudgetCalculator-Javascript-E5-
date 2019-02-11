var budgetController = (function() {
    
    var Expense = function(id, desc ,value){
        this.id =id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalExpense){

        if(totalExpense > 0)
            this.percentage = Math.round((this.value / totalExpense) *100);
        else
            this.percentage = -1;
    } 
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, desc ,value){
        this.id =id;
        this.desc = desc;
        this.value = value;
    };

    
    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function (ele,index,array){
            sum+= ele.value;
        });      

        data.totals[type] = sum;
    
    };

    return {
        addItem: function(type, desc, val){
            var newItem;
            
            // Create a new ID
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            else
                ID = 0;
            
            
            // Create new item based on 'inc' or 'exp' type
            if(type === 'inc') {
                newItem = new Income(ID, desc, val);
            }
            else{
                newItem = new Expense(ID, desc, val);
            }
            
            // Push it into data structure
            data.allItems[type].push(newItem);

            //Return the new Element
            return newItem;
        },

        deleteItem: function(type, id){
            var allID, index;

            allID = data.allItems[type].map(function(current){
                return current.id;
            });

            index = allID.indexOf(id);

            if(index !== -1)
                data.allItems[type].splice(index,1);
            

        },



        calculateBudget: function(){

            // Calculate total income of expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget
            data.budget = data.totals.inc-data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0)
                data.percentage =Math.round(data.totals.exp/(data.totals.inc/100));

        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(current, index, array){
                current.calcPercentage(data.totals.inc);
            })

        },

        getPercentage: function(){
            var allPercentage = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPercentage;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        }



        
    }

    
})();



var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        totalIncomeLabel: '.budget__income--value',
        totalExpensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(number, type){
        var numberSplit, integer, decimal;
        
        number = Math.abs(number);
        number = number.toFixed(2);

        numberSplit = number.split('.');
        decimal = numberSplit[1];
        integer = numberSplit[0];

        
        
        
         //Split Numbers
        if(integer.length> 3){
            integer = integer.substr(0,integer.length -3) + ',' + integer.substr(integer.length-3,3);
        }
        
        if(decimal)
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + integer + '.' + decimal;
        else
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + integer;
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    
    return {
        
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        AddListItem: function(obj, type){
            var html, newHtml, element;

            //Create HTML string with placeholder
            if(type ==='inc'){
                element = DOMstrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">'+
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                element = DOMstrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'+
                 '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>'+
                 '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml)
        },


        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fieldsToClear, fieldsToClearArray;

            fieldsToClear = document.querySelectorAll(DOMstrings.inputDesc +',' + DOMstrings.inputValue);
            fieldsToClearArray = Array.prototype.slice.call(fieldsToClear);
            fieldsToClearArray.forEach(function(current, index, array){
                current.value = "";
            })
            fieldsToClearArray[0].focus();

        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type ='inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.totalIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.totalExpensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = "";
        },

        displayPercentages: function(percentages){
            var fieldsToChange;
            
            fieldsToChange = document.querySelectorAll(DOMstrings.expensesPercentage);
            
            

            nodeListForEach(fieldsToChange, function(current, index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index]+ '%';
                else
                current.textContent = '';
            })


        },

        displayDate: function(){
            var now, year, month;
            
            now = new Date();

            allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = allMonths[month] + ' '+  year;


        },

        changedType: function(){

            var fieldsToChange = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDesc + ','+
                DOMstrings.inputValue
            );

            nodeListForEach(fieldsToChange, function(current){
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        getDOMstrings: function(){
        
            return DOMstrings;
        }
    }  
})();



// Global APP Control
var controller = (function(budgetCtrl, UICtrl) {
    
    
    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem); 

        document.addEventListener('keypress', function(event) {

            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function(){
        // Calculate the budget
        budgetCtrl.calculateBudget();
        // Return the Budget
        var budget = budgetCtrl.getBudget();
        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        // Calculate %
        budgetCtrl.calculatePercentages();

        // Read % from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // Update UI with new %
        UICtrl.displayPercentages(percentages)


    }

    var ctrlAddItem = function () {
        var input, newItem;


        // Get the Field input data
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            // Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    
            // Add the item to the UI
            UICtrl.AddListItem(newItem, input.type);
    
            // Clear Fields
            UICtrl.clearFields();
    
            // Calculate and Update Budget
            updateBudget();

            // Update List %-s
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data strucutre
            budgetCtrl.deleteItem(type, ID);


            // Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // Update and show new Budget
            updateBudget();

            // Update List %-s
            updatePercentages();


        }

    };

    return {
        init: function(){
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
            UICtrl.displayDate();
        }
    }

})(budgetController, UIController);
                    

 controller.init();