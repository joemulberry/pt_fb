
import pyrebase

config = {
  "apiKey": "apiKey",
  "authDomain": "projectId.firebaseapp.com",
  "databaseURL": "https://paratester-9e3c1.firebaseio.com",
  "storageBucket": "projectId.appspot.com"
}


firebase = pyrebase.initialize_app(config)

# # Get a reference to the auth service
# auth = firebase.auth()

# # Log the user in
# user = auth.sign_in_with_email_and_password(email, password)

# Get a reference to the database service
db = firebase.database()


def main(db = db):
    db.child("cards")


if __name__ == '__main__':
    main()



'''
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="/__/firebase/8.10.0/firebase-app.js"></script>

<!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries -->
<script src="/__/firebase/8.10.0/firebase-analytics.js"></script>

<!-- Initialize Firebase -->
<script src="/__/firebase/init.js"></script>
'''
