<?php
class UserTest extends PHPUnit_Framework_TestCase {
    public function testCreateTmp(){
        $user = User::createTmp();
        $this->assertEquals($user->name,'Test User');
    }
}