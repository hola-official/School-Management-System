// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract ClassRegistration {
    address public admin;
    
    struct Student {
        string name;
        bool isRegistered;
    }
    
    mapping(uint256 => Student) public students;
    uint256[] public studentIds;
    
    // Events
    event StudentRegistered(uint256 studentId, string name);
    event StudentRemoved(uint256 studentId);
    
    constructor() {
        admin = msg.sender;
    }
    
    // Modifier to restrict access to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    // Register a new student
    function registerStudent(uint256 _studentId, string memory _name) public onlyAdmin {
        require(!students[_studentId].isRegistered, "Student ID already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        students[_studentId] = Student({
            name: _name,
            isRegistered: true
        });
        
        studentIds.push(_studentId);
        
        emit StudentRegistered(_studentId, _name);
    }
    
    function removeStudent(uint256 _studentId) public onlyAdmin {
        require(students[_studentId].isRegistered, "Student does not exist");
        
        students[_studentId].isRegistered = false;
        
        for (uint i = 0; i < studentIds.length; i++) {
            if (studentIds[i] == _studentId) {
                studentIds[i] = studentIds[studentIds.length - 1];
                studentIds.pop();
                break;
            }
        }
        
        emit StudentRemoved(_studentId);
    }
    
    // Get student information by ID
    function getStudentById(uint256 _studentId) public view returns (string memory name, bool isRegistered) {
        Student memory student = students[_studentId];
        return (student.name, student.isRegistered);
    }
}