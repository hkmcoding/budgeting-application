// Code should be split up into modules. For the current project, we're going to split things up in categories of UI Module, Data Module, and Controller Module. The controller module does what it sounds like, but also links the other two modules together.

// Module Pattern, more about private and public data, encapsulation, and separation of concerns

// Separation of Concerns means that each part should be separated from eachother and do their own thing

// Budget Controller
var budgetController = (function () {
  // Function Constructors, this is being used because there will be a lot of expenses and income objects
  var Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  var Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  var calculateTotal = function (type) {
    var sum = 0
    data.allItems[type].forEach(function (cur) {
      sum += parseFloat(cur.value)
    })
    data.totals[type] = sum
  }

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  return {
    addItem: function (type, des, val) {
      var newItem, ID

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1
      } else {
        ID = 0
      }

      // Create a new item based on inc or exp type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // Push it into our data structure and return the element
      data.allItems[type].push(newItem)
      return newItem
    },

    deleteItem: function (type, id) {
      var ids, index
      var ids = data.allItems[type].map(function (current) {
        return current.id
      })

      index = ids.indexOf(id)

      if (index !== -1) {
        // (Remove at index, and remove 1 item)
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      // Calculate total income and expenses
      calculateTotal('exp')
      calculateTotal('inc')

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
      } else {
        data.percentage = -1
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage()
      })
      return allPerc
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      }
    }
  }
})()

// UI Controller
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function (num, type) {
    var numSplit, int, dec, type

    num = Math.abs(num)
    num = num.toFixed(2)

    numSplit = num.split('.')
    int = numSplit[0]

    // Implement something for numbers in the millions
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
    }

    dec = numSplit[1]
    return (type === 'exp' ? '-' : '+') + ' ' + int +  '.' + dec
  }

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        // This type will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: document.querySelector(DOMstrings.inputValue).value
      }
    },
    addListItem: function (obj, type) {
      var html, newHtml, element
      // Create HTML string with placeholder text

      if (type === 'inc') {
        element = DOMstrings.incomeContainer
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // Replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id)
      newHtml = newHtml.replace('%description%', obj.description)
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

      // Insert HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
    },
    deleteListItem: function (selectorID) {
      var element = document.getElementById(selectorID)
      element.parentNode.removeChild(element)
    },
    clearFields: function () {
      var fields = document.querySelectorAll('input')
      fields.forEach(function (field) {
        field.value = ''
      })
    },
    displayBudget: function (obj) {
      var type

      obj.budget > 0 ? type = 'inc' : type = 'exp'
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc')
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp')
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '--'
      }
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel)

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%'
        } else {
          current.textContent = '--'
        }
      })
    },
    displayMonth: function () {
      var now, year, month, months
      now = new Date()
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      month = now.getMonth()
      year = now.getFullYear()
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year
    },
    changeType: function () {
      var fields = document.querySelectorAll(
          DOMstrings.inputType + ', ' +
          DOMstrings.inputDescription + ', ' +
          DOMstrings.inputValue)

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus')
      })

      document.querySelector(DOMstrings.inputButton).classList.toggle('red')
    },
    getDOMStrings: function () {
      return DOMstrings
    }
  }
})()

// Global App Controller
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings()
    // Creating an event listener
    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem)

    document.addEventListener('keypress', function (event) {
      // Older browsers do not use keyCode so it's good practice to use which
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }

      // Both of these event listeners could use the same code but that goes against the don't repeat yourself (DRY) principle. The best practice option is to write a function
    })

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
  }

  var updatePercentages = function () {
    // Calculate the percentages
    budgetCtrl.calculatePercentages()
    // Read them from the budget controller
    var percentages = budgetCtrl.getPercentages()
    // Update the UI with the new percentages
    UICtrl.displayPercentages(percentages)
  }

  var updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget()

    // Return the budget
    var budget = budgetCtrl.getBudget()

    // Display the budget on the UI
    UICtrl.displayBudget(budget)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // Get field input data
    input = UICtrl.getInput()

    // Add the data to the budget controller
    newItem = budgetCtrl.addItem(input.type, input.description, input.value)

    // Add new item to the UI
    UICtrl.addListItem(newItem, input.type)

    // Clear the fields
    UICtrl.clearFields()

    // Calculate the budget and update it
    updateBudget()

    // Calculate and update percentages
    updatePercentages()
  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id
    if (itemID) {
      splitID = itemID.split('-')
      type = splitID[0]
      ID = parseInt(splitID[1])

      // Delete item from the data structure
      budgetCtrl.deleteItem(type, ID)

      // Delete item from UI
      UICtrl.deleteListItem(itemID)

      // Delete item from the new budget
      updateBudget()
      updatePercentages()
    }
  }

  // Public init function
  return {
    init: function () {
      console.log('Application has started. Enter you budget data.')
      UICtrl.displayMonth()
      UICtrl.displayBudget({ budget: 0, totalIncome: 0, totalExpenses: 0, percentage: -1 })
      setupEventListeners()
    }
  }
})(budgetController, UIController)

controller.init()

// Event Delegation is not attaching the event to the element we're interested in, but the parent element due to event bubbling and the target element property. Use cases:
// 1. When we have an element with lots of child elements that we are interested in
// 2. When we want an event handler attached to an element that is not yet in the DOM when our page is loaded
