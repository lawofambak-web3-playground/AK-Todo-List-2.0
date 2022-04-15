import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAbi from "./TodoList.json";

// Deployed contract address
const contractAddress = "0x292Fdd86A7EaeC494C1dFF3d62E996Fe4941381E";

function App() {

  //Creating state variables
  const [accounts, setAccounts] = useState([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [allTasks, setAllTasks] = useState([]);

  // Check if wallet is connected
  const connectAccounts = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccounts(accounts);
      } else {
        window.alert("Need crypto wallet installed.")
      }
    } catch (error) {
      window.alert(error.message);
    }
  }

  // Sets content state variable to user input
  const inputContent = (e) => {
    setContent(e.target.value);
  }

  // Sets author state variable to user input
  const inputAuthor = (e) => {
    setAuthor(e.target.value);
  }

  // Runs when task is created (when form is submitted)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const networkName = (await provider.getNetwork()).name;

      // Checks if user is connected to Rinkeby network
      if (networkName === "rinkeby") {
        try {
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

          // Calling the "createTask" function from smart contract
          const createTaskTxn = await contract.createTask(content, author);
          await createTaskTxn.wait();

          // Retrieving "taskCount" variable from smart contract
          let taskCount = await contract.taskCount();
          taskCount = taskCount.toNumber();
          // Updating "taskCount" state variable from smart contract value
          setTaskCount(taskCount);

          //Resetting user input state variables
          setContent("");
          setAuthor("");
        } catch (error) {
          window.alert(error.message);
        }
      } else {
        window.alert("Connect to Rinkeby network.")
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Updates "allTasks" state varaible array to add new task added
  const getAllUpdatedTasks = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);

      // Retrieves the mapping of "taskCount"
      const task = await contract.tasks(taskCount);
      const taskId = task[0].toNumber();
      const taskDate = task[1];
      const taskContent = task[2];
      const taskAuthor = task[3];
      const taskCompleted = task[4];

      // Updates the "allTasks" state variable array with newly added task
      setAllTasks(prevState => [...prevState, {
        id: taskId,
        date: new Date(taskDate * 1000),
        content: taskContent,
        author: taskAuthor,
        completed: taskCompleted
      }]);

    } catch (error) {
      window.alert(error);
    }
  }

  // Function that runs on the first render that populates the "allTasks" state variable array
  const getTasks = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);

      // Retrives the "taskCount" value from smart contract
      let taskCount = await contract.taskCount();
      taskCount = taskCount.toNumber();

      // Creates an empty array
      const allTasksArray = [];

      // For loop that loops through all the tasks and pushes the data into the newly created empty array
      for (var i = 1; i <= taskCount; i++) {
        const task = await contract.tasks(i);
        const taskId = task[0].toNumber();
        const taskDate = task[1];
        const taskContent = task[2];
        const taskAuthor = task[3];
        const taskCompleted = task[4];

        allTasksArray.push(
          {
            id: taskId,
            date: new Date(taskDate * 1000),
            content: taskContent,
            author: taskAuthor,
            completed: taskCompleted
          });
      };

      // Updates the "allTasks" state variable array with "allTasksArray" that has the updated data
      setAllTasks(allTasksArray);

    } catch (error) {
      window.alert(error);
    }
  };

  // Runs on first render
  useEffect(() => {
    getTasks();
  }, []);

  // Runs whenever "taskCount" state variable changes
  useEffect(() => {
    getAllUpdatedTasks();
    //eslint-disable-next-line
  }, [taskCount]);

  return (
    <div className="App">
      <h1 className="Header">AK's Todo List 2.0 (Rinkeby)</h1>
      {accounts.length ? (
        <div className="App">
          <label className="AccountAddress">Connected Wallet Address : {accounts[0]}</label>
          <form className="AddTaskForm" onSubmit={handleSubmit}>
            <label className="TaskFormTitle">Create New Task</label>
            <label className="TaskFormText">Content</label>
            <input className="InputSection" name="content" type="text" onChange={inputContent} value={content} />
            <label className="TaskFormText">Author</label>
            <input className="InputSection" name="author" type="text" onChange={inputAuthor} value={author} />
            <button className="AddTaskButton" type="submit">Add Task</button>
          </form>
          <table className="TaskTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Content</th>
                <th>Author</th>
                <th>Completed?</th>
              </tr>
            </thead>
            <tbody>
              {allTasks.map((task, id) => {
                return (
                  <tr key={id}>
                    <td>{task.id}</td>
                    <td>{task.date.toLocaleString()}</td>
                    <td>{task.content}</td>
                    <td>{task.author}</td>
                    <td>{task.completed.toString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>) : (
        <button className="ConnectWalletButton" onClick={connectAccounts}>Connect Wallet</button>
      )
      }
    </div>
  );
}

export default App;
