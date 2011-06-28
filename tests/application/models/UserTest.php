<?php
class UserTest extends PHPUnit_Framework_TestCase {
    public function testCreateTmp(){
        $user = User::createTmp();
        $this->assertEquals($user->name,'Test User');
        $this->assertNotNull($user->id);
        $this->assertEquals($user->role, User::ROLE_TEMP);

        $task = $user->Roottask;
        $this->assertNotNull($task);
        $this->assertNotNull($task->id);
        $this->assertEquals($task->owner_id, $user->id);
    }
}