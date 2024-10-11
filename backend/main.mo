import Array "mo:base/Array";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

actor {
  stable var highScore : Nat = 0;

  public func updateHighScore(score : Nat) : async Nat {
    if (score > highScore) {
      highScore := score;
    };
    highScore
  };

  public query func getHighScore() : async Nat {
    highScore
  };
}
