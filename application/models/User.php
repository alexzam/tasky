<?php

class User extends BaseUser {
    const ROLE_TEMP = 0;
    const ROLE_MAIN = 1;
    const ROLE_ADMIN = 2;

    public function addTask() {
        $t = new Task();
        $t->owner_id = $this->id;
        $t->dropped = false;
        return $t;
    }

    public static function createTmp() {
        $u = new User();

        $u->role = User::ROLE_TEMP;
        $u->name = 'Test User';
        $u->save();

        $rt = $u->addTask();
        $rt->label = 'Root';
        $rt->save();

        $u->link('Roottask', array($rt->id));

        $u->save();

        return $u;
    }
}