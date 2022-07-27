// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

contract TodoList {
    uint public taskCount = 0;
    
    struct Task {
        uint id;
        string task;
        bool completed;
    }

    mapping(uint => Task) public tasks;

    event TaskCreated(
        uint id,
        string content,
        bool completed
    );

    event taskCompleted(
        uint id,
        bool completed
    );

    constructor() public {
        createTask("two-sum     |       https://leetcode.com/problems/two-sum/");
    }

    function createTask(string memory _task) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _task, false);
        emit TaskCreated(taskCount, _task, false);
    }

    function toggleTask(uint _id) public {
        Task memory _task = tasks[_id];  // _ -->represents local var. not syntax. just convention
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit taskCompleted(_id, _task.completed);
    }
}