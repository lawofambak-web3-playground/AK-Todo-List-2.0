// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract TodoList {
    struct Task {
        uint256 id;
        uint256 date;
        string content;
        string author;
        bool completed;
    }

    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;

    function createTask(string memory _content, string memory _author) public {
        taskCount++;
        tasks[taskCount] = Task(
            taskCount,
            block.timestamp,
            _content,
            _author,
            false
        );
    }
}
