<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260419010443 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE enseignant (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, specialite VARCHAR(255) NOT NULL, diplome VARCHAR(255) NOT NULL, sexe VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE enseignement (id INT AUTO_INCREMENT NOT NULL, date DATETIME NOT NULL, enseigants_id INT DEFAULT NULL, filiere_id INT DEFAULT NULL, matiere_id INT DEFAULT NULL, periode_id INT DEFAULT NULL, INDEX IDX_BD310CC54CC8966 (enseigants_id), INDEX IDX_BD310CC180AA129 (filiere_id), INDEX IDX_BD310CCF46CD258 (matiere_id), INDEX IDX_BD310CCF384C1CF (periode_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE enseignement_etudiant (enseignement_id INT NOT NULL, etudiant_id INT NOT NULL, INDEX IDX_8D1A4FEFABEC3B20 (enseignement_id), INDEX IDX_8D1A4FEFDDEAB1A3 (etudiant_id), PRIMARY KEY (enseignement_id, etudiant_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE etudiant (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, prenom VARCHAR(255) NOT NULL, sexe VARCHAR(255) NOT NULL, filieres_id INT DEFAULT NULL, INDEX IDX_717E22E3A5DB2FE8 (filieres_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE filiere (id INT AUTO_INCREMENT NOT NULL, libelle VARCHAR(255) NOT NULL, nombre VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE filiere_matiere (filiere_id INT NOT NULL, matiere_id INT NOT NULL, INDEX IDX_F09B15C9180AA129 (filiere_id), INDEX IDX_F09B15C9F46CD258 (matiere_id), PRIMARY KEY (filiere_id, matiere_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE matiere (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE periode (id INT AUTO_INCREMENT NOT NULL, date DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE enseignement ADD CONSTRAINT FK_BD310CC54CC8966 FOREIGN KEY (enseigants_id) REFERENCES enseignant (id)');
        $this->addSql('ALTER TABLE enseignement ADD CONSTRAINT FK_BD310CC180AA129 FOREIGN KEY (filiere_id) REFERENCES filiere (id)');
        $this->addSql('ALTER TABLE enseignement ADD CONSTRAINT FK_BD310CCF46CD258 FOREIGN KEY (matiere_id) REFERENCES matiere (id)');
        $this->addSql('ALTER TABLE enseignement ADD CONSTRAINT FK_BD310CCF384C1CF FOREIGN KEY (periode_id) REFERENCES periode (id)');
        $this->addSql('ALTER TABLE enseignement_etudiant ADD CONSTRAINT FK_8D1A4FEFABEC3B20 FOREIGN KEY (enseignement_id) REFERENCES enseignement (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE enseignement_etudiant ADD CONSTRAINT FK_8D1A4FEFDDEAB1A3 FOREIGN KEY (etudiant_id) REFERENCES etudiant (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE etudiant ADD CONSTRAINT FK_717E22E3A5DB2FE8 FOREIGN KEY (filieres_id) REFERENCES filiere (id)');
        $this->addSql('ALTER TABLE filiere_matiere ADD CONSTRAINT FK_F09B15C9180AA129 FOREIGN KEY (filiere_id) REFERENCES filiere (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE filiere_matiere ADD CONSTRAINT FK_F09B15C9F46CD258 FOREIGN KEY (matiere_id) REFERENCES matiere (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE enseignement DROP FOREIGN KEY FK_BD310CC54CC8966');
        $this->addSql('ALTER TABLE enseignement DROP FOREIGN KEY FK_BD310CC180AA129');
        $this->addSql('ALTER TABLE enseignement DROP FOREIGN KEY FK_BD310CCF46CD258');
        $this->addSql('ALTER TABLE enseignement DROP FOREIGN KEY FK_BD310CCF384C1CF');
        $this->addSql('ALTER TABLE enseignement_etudiant DROP FOREIGN KEY FK_8D1A4FEFABEC3B20');
        $this->addSql('ALTER TABLE enseignement_etudiant DROP FOREIGN KEY FK_8D1A4FEFDDEAB1A3');
        $this->addSql('ALTER TABLE etudiant DROP FOREIGN KEY FK_717E22E3A5DB2FE8');
        $this->addSql('ALTER TABLE filiere_matiere DROP FOREIGN KEY FK_F09B15C9180AA129');
        $this->addSql('ALTER TABLE filiere_matiere DROP FOREIGN KEY FK_F09B15C9F46CD258');
        $this->addSql('DROP TABLE enseignant');
        $this->addSql('DROP TABLE enseignement');
        $this->addSql('DROP TABLE enseignement_etudiant');
        $this->addSql('DROP TABLE etudiant');
        $this->addSql('DROP TABLE filiere');
        $this->addSql('DROP TABLE filiere_matiere');
        $this->addSql('DROP TABLE matiere');
        $this->addSql('DROP TABLE periode');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
