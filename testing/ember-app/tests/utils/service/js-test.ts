import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { service } from 'ember-resources/util/service';
import { destroy, registerDestructor } from '@ember/destroyable';
import { settled } from '@ember/test-helpers';

module('Utils | service | js', function (hooks) {
  setupTest(hooks);

  module('any class', function () {
    test('works', async function (assert) {
      class MyService {
        @tracked data = 0;

        inc = () => this.data++;
      }

      class Test {
        @service(MyService) declare foo: MyService;
      }

      let myTest = new Test();

      setOwner(myTest, this.owner);

      assert.strictEqual(myTest.foo.data, 0);

      myTest.foo.inc();

      assert.strictEqual(myTest.foo.data, 1);
    });

    test('is torn down when the owner is torn down', async function (assert) {
      class MyService {
        foo = 0;
        constructor() {
          assert.step('created');
          registerDestructor(this, () => assert.step('destroying'));
        }
      }

      class Test {
        @service(MyService) declare foo: MyService;
      }

      let owner = {};
      let myTest = new Test();

      // service was not accessed so this does nothing
      setOwner(myTest, owner);
      destroy(owner);


      // property on service is accessed, so it is created
      owner = {};
      myTest = new Test();
      setOwner(myTest, owner);
      myTest.foo.foo;
      destroy(owner);
      await settled();

      assert.verifySteps(['created', 'destroying']);
    });
  });
});
