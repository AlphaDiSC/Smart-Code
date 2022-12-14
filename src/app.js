App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()  // call render fn declared later
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    web3.eth.defaultAccount = ethereum._state.accounts[0]   // default account if account[0] is empty
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    const todoList = await $.getJSON("TodoList.json")   // jquery
    //  Truffle Contract -> js representation of smart contract, that allows to call fns on it.
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)

    App.todoList = await App.contracts.TodoList.deployed()
  },
  // Render info on page
  render: async () => {
    //prevent double render
    if(App.loading) {
        return
    }
    // update app loading state
    App.setLoading(true)

    // render account
    $('#account').html(App.account)

    //render tasks
    await App.renderTasks()

    //update loading state
    App.setLoading(false)
    
  },

  renderTasks: async () => {
    // load total taskcount from blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // render each task with new task template
    for(var i = 1; i <= taskCount; i++) {
        // fetch task data
        const task = await App.todoList.tasks(i)    // return array
        const taskId = task[0].toNumber()
        const taskContent = task[1]
        const taskCompleted = task[2]

        // create html for task
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content').html(taskContent) // fill task content
        $newTaskTemplate.find('input')  // checkbox
                        .prop('name', taskId)
                        .prop('checked', taskCompleted)
                        .on('click', App.toggleTask)   // on click

        // put each task in correct list
        if(taskCompleted) {
            $('#completedTaskList').append($newTaskTemplate)
        } else {
            $('#taskList').append($newTaskTemplate)
        }

        // show the task
        $newTaskTemplate.show()
    }    
  },

  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    const url = content.split("/")
    let qName = url[4];
    q = qName.replace(/-/i, ' ')
    await App.todoList.createTask(q + "   |   " + content)
    window.location.reload()    // refersh page to show new task added
  },

  toggleTask: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleTask(taskId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if(boolean) {
        loader.show()
        content.hide()
    } else {
        loader.hide()
        content.show()
    }
  }  
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})